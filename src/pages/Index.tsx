import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

const Index = () => {
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
  const navigate = useNavigate();

  // Check for video parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    const colorParam = urlParams.get('playButtonColor');
    const sizeParam = urlParams.get('playButtonSize');
    
    if (videoParam) {
      setCurrentVideo(decodeURIComponent(videoParam));
    }
    if (colorParam) {
      setPlayButtonColor(decodeURIComponent(colorParam));
    }
    if (sizeParam) {
      setPlayButtonSize(parseInt(sizeParam) || 96);
    }
  }, []);

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
      // Create campaign in database
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      const campaignName = isYouTube ? 'YouTube Video' : url;
      
      // Generate embed code and script
      const embedCode = generateEmbedCode(url, playButtonColor, playButtonSize, startTimeParam, endTimeParam);
      const scriptCode = generateScriptCode(url, playButtonColor, playButtonSize);
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: session.user.id,
          name: campaignName,
          video_type: isYouTube ? 'youtube' : 'self-hosted',
          video_url: url,
          youtube_title: isYouTube ? campaignName : null,
          html_script: embedCode,
          javascript_script: scriptCode
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentVideo(url);
      setStartTime(startTimeParam);
      setEndTime(endTimeParam);
      
      toast({
        title: "Campaign created successfully!",
        description: "Your campaign has been saved and is ready to use.",
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error creating campaign",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmbedCode = (url: string, color: string, size: number, startTime?: number, endTime?: number) => {
    const params = new URLSearchParams();
    params.append('video', encodeURIComponent(url));
    params.append('playButtonColor', encodeURIComponent(color));
    params.append('playButtonSize', size.toString());
    if (startTime !== undefined) params.append('startTime', startTime.toString());
    if (endTime !== undefined) params.append('endTime', endTime.toString());
    
    return `<iframe src="${window.location.origin}/embed?${params.toString()}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
  };

  const generateScriptCode = (url: string, color: string, size: number) => {
    return `<script>
// Watchables Overlay Button Script
(function() {
  const button = document.createElement('button');
  button.innerHTML = 'Watch Video';
  button.style.cssText = \`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${color};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    z-index: 9999;
  \`;
  button.onclick = () => window.open('${url}', '_blank');
  document.body.appendChild(button);
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
    setCurrentVideo(null);
    setStartTime(undefined);
    setEndTime(undefined);
  };

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
              Load Different Video
            </Button>
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
            {/* 1. Customize Play Button */}
            <PlayButtonCustomizer
              color={playButtonColor}
              size={playButtonSize}
              onColorChange={setPlayButtonColor}
              onSizeChange={setPlayButtonSize}
              isOpen={showCustomizer}
              onToggle={setShowCustomizer}
            />
            
            {/* 2. Embed This Video */}
            <EmbedCodeGenerator 
              videoUrl={currentVideo} 
              playButtonColor={playButtonColor}
              playButtonSize={playButtonSize}
              startTime={startTime}
              endTime={endTime}
            />
            
            {/* 3. Add Overlay Button to Your Website */}
            <ExternalVideoScript />
            
            {/* 4. Timed Button */}
            <TimedButton />
          </div>

          {/* Instructions */}
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <div className="bg-card border border-player-border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4 text-foreground">
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd>
                  <span>Play / Pause</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F</kbd>
                  <span>Fullscreen</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">M</kbd>
                  <span>Mute / Unmute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <VideoUrlInput 
            onVideoSubmit={handleVideoSubmit}
            isLoading={isLoading}
          />
        </div>
      )}
      <Dialog open={showRestrictedDialog} onOpenChange={setShowRestrictedDialog}>
        <DialogContent className="sm:max-w-md border border-border shadow-player">
          <DialogHeader>
            {restrictionType === 'unauthenticated' ? (
              <>
                <DialogTitle>Create a free account to continue</DialogTitle>
                <DialogDescription>
                  Please create a free account to load and customize videos.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Feature available to users only</DialogTitle>
                <DialogDescription>
                  To load and customize videos, please upgrade to a user account. For full access, contact us on Instagram.
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

export default Index;
