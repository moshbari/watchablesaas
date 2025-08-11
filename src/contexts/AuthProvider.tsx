import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { cleanupAuthState } from "@/lib/auth";

export type AppRole = "admin" | "user" | "interested";

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
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
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      return { error: e?.message || "Failed to sign in" };
    }
  };

  const signUp: AuthContextValue["signUp"] = async (email, password) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
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
