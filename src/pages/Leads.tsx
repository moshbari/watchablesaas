import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  page_id: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickPeriod, setQuickPeriod] = useState<string>('all-time');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, [startDate, endDate]);

  const handleQuickPeriodChange = (value: string) => {
    setQuickPeriod(value);
    const now = new Date();
    
    switch (value) {
      case 'today':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        setStartDate(startOfDay(yesterday));
        setEndDate(endOfDay(yesterday));
        break;
      case 'this-week':
        setStartDate(startOfWeek(now, { weekStartsOn: 0 }));
        setEndDate(endOfWeek(now, { weekStartsOn: 0 }));
        break;
      case 'last-7-days':
        setStartDate(startOfDay(subDays(now, 6)));
        setEndDate(endOfDay(now));
        break;
      case 'last-week':
        const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 0 });
        const lastWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 0 });
        setStartDate(lastWeekStart);
        setEndDate(lastWeekEnd);
        break;
      case 'this-month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'last-30-days':
        setStartDate(startOfDay(subDays(now, 29)));
        setEndDate(endOfDay(now));
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case 'year-to-date':
        setStartDate(startOfYear(now));
        setEndDate(endOfDay(now));
        break;
      case 'last-year':
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        setStartDate(startOfYear(lastYear));
        setEndDate(endOfYear(lastYear));
        break;
      case 'all-time':
        setStartDate(undefined);
        setEndDate(undefined);
        break;
    }
  };

  const fetchLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      // Apply date filters
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Leads</CardTitle>
            <CardDescription>
              View all leads collected from your pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quick Periods */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Periods</label>
                    <Select value={quickPeriod} onValueChange={handleQuickPeriodChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="year-to-date">Year-to-Date</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                        <SelectItem value="all-time">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date ? startOfDay(date) : undefined);
                            setQuickPeriod('custom');
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date ? endOfDay(date) : undefined);
                            setQuickPeriod('custom');
                          }}
                          disabled={(date) => startDate ? date < startDate : false}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads Table */}
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No leads yet. Enable lead optin on your pages to start collecting leads.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead, index) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {format(new Date(lead.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>{lead.name || '-'}</TableCell>
                        <TableCell>{lead.email || '-'}</TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leads;
