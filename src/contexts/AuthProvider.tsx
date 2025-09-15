import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { cleanupAuthState } from "@/lib/auth";

export type AppRole = 'TRIAL' | 'UNLIMITED' | 'SUSPENDED' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  trial_started_at?: string;
  trial_ends_at?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile for a given user id
  const loadProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role,created_at")
      .eq("id", uid)
      .maybeSingle();
    if (!error) setProfile(data as Profile | null);
  };

  useEffect(() => {
    // 1) Subscribe first
    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer to avoid potential deadlocks
        setTimeout(() => {
          loadProfile(newSession.user!.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // 2) Then get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    try {
      // Log connection attempt for debugging
      console.log("Attempting to sign in...", { 
        supabaseUrl: "https://kjabpmcsiluvtxmbbfbg.supabase.co",
        userAgent: navigator.userAgent,
        location: window.location.href,
        origin: window.location.origin
      });
      
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        console.error("Supabase sign in error:", error);
        
        // Check for specific authentication URL errors
        if (error.message.includes('invalid_request') || error.message.includes('redirect')) {
          return { 
            error: `Authentication URL configuration error. Please check that your current URL (${window.location.origin}) is configured in Supabase authentication settings. Error: ${error.message}` 
          };
        }
        
        return { error: error.message };
      }
      return {};
    } catch (e: any) {
      console.error("Network/Connection error during sign in:", {
        error: e,
        message: e?.message,
        stack: e?.stack,
        name: e?.name,
        supabaseUrl: "https://kjabpmcsiluvtxmbbfbg.supabase.co",
        currentOrigin: window.location.origin
      });
      
      // More specific error messages for network issues
      if (e?.message?.includes('fetch') || e?.name === 'TypeError') {
        return { 
          error: `Network connection failed. Please check your internet connection and try again. If the problem persists, contact support. Error: ${e?.message}` 
        };
      }
      
      return { error: e?.message || "Failed to sign in" };
    }
  };

  const signUp: AuthContextValue["signUp"] = async (email, password) => {
    try {
      console.log("Attempting custom signup with Mandrill email...");
      
      // Get the current origin for redirect URL
      const redirectUrl = `${window.location.origin}/`;
      console.log("Using redirect URL:", redirectUrl);
      
      // Use our custom signup function that bypasses Supabase rate limits
      const { data, error } = await supabase.functions.invoke('custom-signup', {
        body: { 
          email, 
          password,
          redirectUrl // Pass the redirect URL to the edge function
        }
      });

      if (error) {
        console.error("Custom signup error:", error);
        return { error: error.message };
      }

      if (data?.error) {
        console.error("Custom signup function error:", data.error);
        return { error: data.error };
      }

      console.log("Custom signup successful:", data);
      return {};
    } catch (e: any) {
      console.error("Network error during custom signup:", e);
      return { error: e?.message || "Failed to sign up" };
    }
  };

  const signOut = async () => {
    cleanupAuthState();
    try { await supabase.auth.signOut({ scope: "global" }); } catch {}
    window.location.href = "/login";
  };

  const value: AuthContextValue = useMemo(() => ({
    user,
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
