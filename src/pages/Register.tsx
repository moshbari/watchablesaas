import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate } from "react-router-dom";

const Register: React.FC = () => {
  const { signUp, session } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "Confirm your email to finish signup." });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md border rounded-lg p-6 bg-card">
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign up with email and password</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link to="/login" className="underline">Have an account? Log in</Link>
        </div>
      </section>
    </main>
  );
};

export default Register;
