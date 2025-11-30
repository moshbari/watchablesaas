import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface LandingLead {
  id: string;
  email: string;
  consent_given: boolean;
  created_at: string;
}

export default function LandingLeads() {
  const [leads, setLeads] = useState<LandingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch landing page leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!leads.length) {
      toast({
        title: 'No Data',
        description: 'There are no leads to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['#', 'Date', 'Email', 'Consent Given'];
    const rows = leads.map((lead, index) => [
      index + 1,
      format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm'),
      lead.email,
      lead.consent_given ? 'Yes' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Leads exported successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Landing Page Leads</CardTitle>
            <CardDescription>
              Email addresses collected from the landing page opt-in forms
            </CardDescription>
          </div>
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found yet.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Consent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, index) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>
                        <span className={lead.consent_given ? 'text-green-600' : 'text-red-600'}>
                          {lead.consent_given ? '✓ Yes' : '✗ No'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}