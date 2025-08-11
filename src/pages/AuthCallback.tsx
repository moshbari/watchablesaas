import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AuthCallback: React.FC = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"verifying" | "recover" | "done">("verifying");

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStage("recover");
      }
    });
    // Also check session directly in case it's already set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStage("recover");
      else setStage("done");
    });
    return () => { sub.data.subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated" });
      window.location.href = "/login";
    }
  };

  if (stage === "verifying") return <div className="p-6 text-sm text-muted-foreground">Verifying link…</div>;
  if (stage === "done") return <div className="p-6 text-sm text-muted-foreground">Link verified. You may close this tab.</div>;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md border rounded-lg p-6 bg-card">
        <h1 className="text-2xl font-semibold mb-2">Set new password</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full">Update password</Button>
        </form>
      </section>
    </main>
  );
};

export default AuthCallback;
