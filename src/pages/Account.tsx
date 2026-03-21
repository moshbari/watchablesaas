import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Account: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const { toast } = useToast();
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const email = useMemo(() => user?.email ?? profile?.email ?? "", [user, profile]);

  useEffect(() => {
    if (email) setResetEmail(email);
  }, [email]);

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: redirectUrl });
      if (error) throw error;
      toast({ title: "Password reset sent", description: "Check your email for the reset link." });
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords match.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Account</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your account settings</p>

      <div className="grid gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="text-lg">{email || "—"}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Role</div>
          <div className="text-lg">{profile?.role ?? "—"}</div>
        </div>

        <form onSubmit={changePassword} className="border rounded-lg p-4 grid gap-3">
          <div className="text-sm font-medium">Change password</div>
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-fit" disabled={changingPassword}>
            {changingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>

        <form onSubmit={sendReset} className="border rounded-lg p-4 grid gap-3">
          <div>
            <div className="text-sm mb-2">Send password reset link</div>
            <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-fit">Send reset email</Button>
        </form>

        <div className="border rounded-lg p-4">
          <Button variant="outline" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </main>
  );
};

export default Account;
