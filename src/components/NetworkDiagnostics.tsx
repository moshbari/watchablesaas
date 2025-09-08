import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";

export const NetworkDiagnostics: React.FC = () => {
  const [tests, setTests] = useState<Record<string, 'pending' | 'success' | 'failed' | 'testing'>>({});
  const [details, setDetails] = useState<Record<string, string>>({});

  const runTest = async (name: string, testFn: () => Promise<{ success: boolean; message: string }>) => {
    setTests(prev => ({ ...prev, [name]: 'testing' }));
    try {
      const result = await testFn();
      setTests(prev => ({ ...prev, [name]: result.success ? 'success' : 'failed' }));
      setDetails(prev => ({ ...prev, [name]: result.message }));
    } catch (error: any) {
      setTests(prev => ({ ...prev, [name]: 'failed' }));
      setDetails(prev => ({ ...prev, [name]: error.message || 'Unknown error' }));
    }
  };

  const testSupabaseConnectivity = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch('https://kjabpmcsiluvtxmbbfbg.supabase.co/rest/v1/', {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWJwbWNzaWx1dnR4bWJiZmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTcwOTgsImV4cCI6MjA3MDQ5MzA5OH0.KFx4TVE4Nc0NtDiTMC3rwTXadD9maygfri_L-0qRhME'
        }
      });
      clearTimeout(timeoutId);
      return {
        success: response.status === 200 || response.status === 401, // 401 is also valid (unauthorized but server is reachable)
        message: `HTTP ${response.status}: Server is reachable`
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return { success: false, message: 'Connection timed out after 10 seconds' };
      }
      return { success: false, message: `Network error: ${error.message}` };
    }
  };

  const testDNS = async () => {
    try {
      // Try to resolve DNS by making a simple request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://kjabpmcsiluvtxmbbfbg.supabase.co/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return { success: true, message: 'DNS resolution successful' };
    } catch (error: any) {
      if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        return { success: false, message: 'DNS resolution failed - hostname not found' };
      }
      return { success: false, message: `DNS test inconclusive: ${error.message}` };
    }
  };

  const testGeneralInternet = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return { success: true, message: 'General internet connectivity working' };
    } catch (error: any) {
      return { success: false, message: `No internet connectivity: ${error.message}` };
    }
  };

  const runAllTests = async () => {
    await Promise.all([
      runTest('internet', testGeneralInternet),
      runTest('dns', testDNS),
      runTest('supabase', testSupabaseConnectivity)
    ]);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Network Diagnostics
        </CardTitle>
        <CardDescription>
          Debugging connection issues to Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[
            { key: 'internet', name: 'General Internet Connectivity' },
            { key: 'dns', name: 'DNS Resolution (kjabpmcsiluvtxmbbfbg.supabase.co)' },
            { key: 'supabase', name: 'Supabase API Connectivity' }
          ].map(({ key, name }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(tests[key] || 'pending')}
                <span className="font-medium">{name}</span>
              </div>
              <div className="text-sm text-muted-foreground max-w-xs text-right">
                {details[key] || 'Pending...'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={runAllTests} className="w-full">
            Run Tests Again
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Troubleshooting Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>If DNS fails: Check your server's DNS settings or try different DNS servers (8.8.8.8, 1.1.1.1)</li>
            <li>If Supabase fails but internet works: Your hosting provider might block supabase.co</li>
            <li>Check your hosting provider's firewall settings</li>
            <li>Try accessing https://kjabpmcsiluvtxmbbfbg.supabase.co directly from your server</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};