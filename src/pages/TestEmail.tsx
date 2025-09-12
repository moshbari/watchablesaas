import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TestEmail: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("mdtahmidurrahman2020@gmail.com");
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send test email');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success!",
        description: `Test email sent to ${email} via Mandrill`,
      });
      console.log("Email sent successfully:", data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send test email",
        variant: "destructive",
      });
      console.error("Error sending email:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Email Sender</CardTitle>
          <CardDescription>
            Send a test password recovery email via Mandrill
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
          <Button 
            onClick={sendTestEmail} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default TestEmail;