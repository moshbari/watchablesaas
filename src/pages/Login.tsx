import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate, useLocation } from "react-router-dom";
import { NetworkDiagnostics } from "@/components/NetworkDiagnostics";

const Login: React.FC = () => {
  const { signIn, session } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  if (session) return <Navigate to={from} replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error, variant: "destructive" });
      
      // Show diagnostics if it looks like a network error
      if (error.includes('Network connection failed') || error.includes('fetch')) {
        setShowDiagnostics(true);
      }
    } else {
      toast({ title: "Welcome back" });
      setShowDiagnostics(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        <section className="w-full max-w-md mx-auto border rounded-lg p-6 bg-card">
          <h1 className="text-2xl font-semibold mb-2">Log in</h1>
          <p className="text-sm text-muted-foreground mb-6">Access your account</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
          </form>
          <div className="flex justify-between items-center mt-4 text-sm">
            <Link to="/register" className="underline">Create account</Link>
            <Link to="/forgot-password" className="underline">Forgot password?</Link>
          </div>
          
          {!showDiagnostics && (
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDiagnostics(true)}
                className="w-full"
              >
                Having connection issues? Run Network Diagnostics
              </Button>
            </div>
          )}
        </section>

        {showDiagnostics && (
          <div className="space-y-4">
            <NetworkDiagnostics />
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowDiagnostics(false)}
              >
                Hide Diagnostics
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Login;
