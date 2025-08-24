import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoUrlInput } from '@/components/VideoUrlInput';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';
import { TimedButton } from '@/components/TimedButton';
import { PlayButtonCustomizer } from '@/components/PlayButtonCustomizer';
import { ExternalVideoScript } from '@/components/ExternalVideoScript';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Campaign {
  id: string;
  name: string;
  video_type: string;
  video_url: string | null;
  youtube_title: string | null;
  html_script: string;
  javascript_script: string;
  created_at: string;
  updated_at: string;
}

const EditCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [endTime, setEndTime] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [playButtonColor, setPlayButtonColor] = useState('#ff0000');
  const [playButtonSize, setPlayButtonSize] = useState(96);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [overlayButtonConfig] = useState({
    enabled: true,
    text: 'Get Started Now!',
    url: 'https://example.com',
    delay: 3,
    position: 'center' as const,
    width: '300px',
    height: '50px',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    fontSize: '16px'
  });
  const { toast } = useToast();
  const { role, session } = useAuth();
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);
  const [restrictionType, setRestrictionType] = useState<'unauthenticated' | 'interested' | null>(null);

  useEffect(() => {
    if (id && session) {
      fetchCampaign();
    }
  }, [id, session]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setCampaign(data);
      setCurrentVideo(data.video_url);
      
      // Extract customization from existing data if possible
      // This is a simplified approach - in a real app you'd store these separately
      setPlayButtonColor('#ff0000'); // Default for now
      setPlayButtonSize(96); // Default for now
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch campaign details',
        variant: 'destructive',
      });
      navigate('/campaigns');
    }
  };

  const handleVideoSubmit = async (url: string, startTimeParam?: number, endTimeParam?: number) => {
    if (!session) {
      setRestrictionType('unauthenticated');
      setShowRestrictedDialog(true);
      return;
    }
    if (role === 'interested') {
      setRestrictionType('interested');
      setShowRestrictedDialog(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      let campaignName = url;
      
      // Get YouTube video title
      if (isYouTube) {
        try {
          campaignName = await getYouTubeTitle(url);
        } catch (error) {
          console.error('Error fetching YouTube title:', error);
          campaignName = 'YouTube Video';
        }
      }
      
      const embedCode = generateEmbedCode(url, playButtonColor, playButtonSize, startTimeParam, endTimeParam);
      const scriptCode = generateScriptCode(url, playButtonColor, playButtonSize);
      
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: campaignName,
          video_type: isYouTube ? 'youtube' : 'self-hosted',
          video_url: url,
          youtube_title: isYouTube ? campaignName : null,
          html_script: embedCode,
          javascript_script: scriptCode
        })
        .eq('id', id);

      if (error) throw error;

      setCurrentVideo(url);
      setStartTime(startTimeParam);
      setEndTime(endTimeParam);
      
      toast({
        title: "Campaign updated successfully!",
        description: "Your campaign changes have been saved.",
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error updating campaign",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getYouTubeTitle = async (url: string): Promise<string> => {
    // Extract video ID from URL
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (!match) throw new Error('Invalid YouTube URL');
    
    const videoId = match[1];
    
    // Use YouTube oEmbed API to get title
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!response.ok) throw new Error('Failed to fetch video title');
    
    const data = await response.json();
    return data.title || 'YouTube Video';
  };

  const generateEmbedCode = (url: string, color: string, size: number, startTime?: number, endTime?: number) => {
    const params = new URLSearchParams();
    params.append('video', encodeURIComponent(url));
    params.append('playButtonColor', encodeURIComponent(color));
    params.append('playButtonSize', size.toString());
    if (startTime !== undefined) params.append('startTime', startTime.toString());
    if (endTime !== undefined) params.append('endTime', endTime.toString());
    
    return `<center><iframe src="https://watchable.99dfy.com/embed-player.html?${params.toString()}" width="800" height="450" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" style="max-width: 100%; height: auto; aspect-ratio: 16/9;"></iframe></center>`;
  };

  const generateScriptCode = (url: string, color: string, size: number) => {
    return `<script>
// Watchables Embedded Player Script
(function() {
  const iframe = document.createElement('iframe');
  iframe.src = 'https://watchable.99dfy.com/embed-player.html?video=${encodeURIComponent(url)}&playButtonColor=${encodeURIComponent(color)}&playButtonSize=${size}';
  iframe.style.cssText = \`
    width: 100%;
    height: 400px;
    border: none;
    border-radius: 8px;
  \`;
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  
  // Insert the iframe where the script is placed
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  currentScript.parentNode.insertBefore(iframe, currentScript);
})();
</script>`;
  };

  const handleVideoError = (error: string) => {
    toast({
      title: "Video Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleBack = () => {
    navigate('/campaigns');
  };

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentVideo ? (
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Campaign: {campaign.name}</h1>
          </div>

          {/* Video Player */}
          <div className="max-w-6xl mx-auto">
            <VideoPlayer 
              src={currentVideo} 
              onError={handleVideoError}
              playButtonColor={playButtonColor}
              playButtonSize={playButtonSize}
              overlayButtonConfig={overlayButtonConfig}
              startTime={startTime}
              endTime={endTime}
            />
          </div>

          {/* Customization & Embed Options */}
          <div className="max-w-4xl mx-auto mt-8 space-y-6">
            <PlayButtonCustomizer
              color={playButtonColor}
              size={playButtonSize}
              onColorChange={setPlayButtonColor}
              onSizeChange={setPlayButtonSize}
              isOpen={showCustomizer}
              onToggle={setShowCustomizer}
            />
            
            <EmbedCodeGenerator 
              videoUrl={currentVideo} 
              playButtonColor={playButtonColor}
              playButtonSize={playButtonSize}
              startTime={startTime}
              endTime={endTime}
            />
            
            <ExternalVideoScript />
            <TimedButton />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-2xl">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </div>
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-center">Edit Campaign: {campaign.name}</h1>
            </div>
            
            <VideoUrlInput 
              onVideoSubmit={handleVideoSubmit}
              isLoading={isLoading}
              isEditing={true}
              initialUrl={campaign.video_url || ''}
              initialStartTime={startTime}
              initialEndTime={endTime}
            />
          </div>
        </div>
      )}
      
      <Dialog open={showRestrictedDialog} onOpenChange={setShowRestrictedDialog}>
        <DialogContent className="sm:max-w-md border border-border shadow-player">
          <DialogHeader>
            {restrictionType === 'unauthenticated' ? (
              <>
                <DialogTitle>Create a free account to continue</DialogTitle>
                <DialogDescription>
                  Please create a free account to edit campaigns.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Feature available to users only</DialogTitle>
                <DialogDescription>
                  To edit campaigns, please upgrade to a user account.
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowRestrictedDialog(false)}>
              Close
            </Button>
            {restrictionType === 'unauthenticated' ? (
              <Button variant="hero" onClick={() => navigate('/register')}>
                Create free account
              </Button>
            ) : (
              <Button variant="hero" onClick={() => window.open('https://www.instagram.com/askmoshbari/', '_blank', 'noopener,noreferrer')}>
                <Instagram className="mr-2 h-4 w-4" aria-hidden="true" />
                Contact on Instagram
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditCampaign;