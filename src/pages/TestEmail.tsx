import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const TestEmail: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("mdtahmidurrahman2020@gmail.com");
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://kjabpmcsiluvtxmbbfbg.supabase.co/functions/v1/send-test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWJwbWNzaWx1dnR4bWJiZmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTcwOTgsImV4cCI6MjA3MDQ5MzA5OH0.KFx4TVE4Nc0NtDiTMC3rwTXadD9maygfri_L-0qRhME`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send test email');
      }

      const result = await response.json();
      toast({
        title: "Success!",
        description: `Test email sent to ${email} via Mandrill`,
      });
      console.log("Email sent successfully:", result);
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