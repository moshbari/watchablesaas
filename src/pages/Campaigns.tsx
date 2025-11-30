import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCampaignLimits } from '@/hooks/useCampaignLimits';
import { UpgradeModal } from '@/components/UpgradeModal';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Campaign {
  id: string;
  name: string;
  video_type: string;
  video_url: string | null;
  youtube_title: string | null;
  html_script: string;
  javascript_script: string;
  start_time: number | null;
  end_time: number | null;
  created_at: string;
  updated_at: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canCreateVideo } = useCampaignLimits();

  useEffect(() => {
    if (session?.user) {
      fetchCampaigns();
    }
  }, [session]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'HTML' | 'JavaScript') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${type} script copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      // Permanently delete from database (not soft delete)
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Campaign Deleted',
        description: 'Campaign has been permanently deleted.',
      });

      // Refresh the campaigns list
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to view your campaigns.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Loading campaigns...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Campaigns</h1>
        <Button 
          onClick={() => {
            if (canCreateVideo) {
              navigate('/campaigns/new');
            } else {
              setShowUpgradeModal(true);
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        campaignType="video"
      />

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No campaigns found. Create your first campaign!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Video URL</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign, index) => {
                  // Helper function to format time
                  const formatTime = (seconds: number | null) => {
                    if (seconds === null || seconds === undefined) {
                      return '0:00'; // Show 0:00 for display purposes when no time is set
                    }
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = seconds % 60;
                    if (hours > 0) {
                      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    }
                    return `${minutes}:${secs.toString().padStart(2, '0')}`;
                  };

                  // Extract times from HTML script if not in database columns
                  let startTime = campaign.start_time;
                  let endTime = campaign.end_time;
                  
                  if (!startTime && !endTime && campaign.html_script) {
                    const urlParams = new URLSearchParams(campaign.html_script.split('?')[1]?.split('"')[0] || '');
                    startTime = urlParams.get('startTime') ? parseInt(urlParams.get('startTime')!) : null;
                    endTime = urlParams.get('endTime') ? parseInt(urlParams.get('endTime')!) : null;
                  }

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-mono">
                        {String(index + 1).padStart(3, '0')}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={campaign.name}>
                          {campaign.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={campaign.video_type === 'youtube' ? 'default' : 'secondary'}>
                          {campaign.video_type === 'youtube' ? 'YouTube' : 'Self-hosted'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {campaign.video_url ? (
                          <a
                            href={campaign.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline truncate"
                            title={campaign.video_url}
                          >
                            <span className="truncate max-w-32">
                              {campaign.video_url.replace(/^https?:\/\//, '')}
                            </span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(startTime)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(endTime)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.updated_at), 'MMM dd, yyyy')}
                       </TableCell>
                       <TableCell>
                         <div className="flex gap-1">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => {
                               // Generate fresh HTML code using the exact same logic as the working version
                               const generateEmbedCode = (url: string, color: string, size: number, startTime?: number, endTime?: number) => {
                                 const params = new URLSearchParams();
                                 params.append('video', encodeURIComponent(url));
                                 params.append('playButtonColor', encodeURIComponent(color));
                                 params.append('playButtonSize', size.toString());
                                 if (startTime !== undefined) params.append('startTime', startTime.toString());
                                 if (endTime !== undefined) params.append('endTime', endTime.toString());
                                 
                                 return `<center><iframe src="${window.location.origin}/embed?${params.toString()}" width="800" height="450" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" style="max-width: 100%; height: auto; aspect-ratio: 16/9;"></iframe></center>`;
                               };
                               
                               const freshHtmlCode = generateEmbedCode(
                                 campaign.video_url || '', 
                                 '#ff0000', 
                                 96, 
                                 startTime || undefined, 
                                 endTime || undefined
                               );
                               copyToClipboard(freshHtmlCode, 'HTML');
                             }}
                             title="Copy HTML Script"
                           >
                             <Copy className="w-3 h-3" />
                             HTML
                           </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                              title="Edit Campaign"
                            >
                             <Edit className="w-3 h-3" />
                           </Button>
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 title="Delete Campaign"
                               >
                                 <Trash2 className="w-3 h-3" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>⚠️ Permanently Delete Campaign</AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2">
                                    <p className="font-semibold text-destructive">
                                      Are you sure you want to permanently delete "{campaign.name}"?
                                    </p>
                                    <p>
                                      <strong>Warning:</strong> This action cannot be undone. The campaign will be immediately and permanently deleted from the database.
                                    </p>
                                    <p>
                                      <strong>Impact:</strong> All embedded videos using this campaign's code will stop working on websites where they are currently placed.
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction
                                   onClick={() => deleteCampaign(campaign.id)}
                                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 >
                                    Delete Forever
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         </div>
                       </TableCell>
                     </TableRow>
                   );
                 })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Campaigns;