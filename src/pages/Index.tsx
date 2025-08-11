import React, { useState, useEffect } from 'react';
import { ArrowLeft, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoUrlInput } from '@/components/VideoUrlInput';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';
import { TimedButton } from '@/components/TimedButton';
import { PlayButtonCustomizer } from '@/components/PlayButtonCustomizer';
import { ExternalVideoScript } from '@/components/ExternalVideoScript';
import { VideoOverlayButton, type OverlayButtonConfig } from '@/components/VideoOverlayButton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const Index = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playButtonColor, setPlayButtonColor] = useState('#ff0000');
  const [playButtonSize, setPlayButtonSize] = useState(96);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [overlayButtonConfig, setOverlayButtonConfig] = useState<OverlayButtonConfig>({
    enabled: false,
    text: 'Click Here!',
    url: 'https://example.com',
    delay: 3,
    position: 'top-right',
    width: '200px',
    height: '50px',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    fontSize: '16px'
  });
  const { toast } = useToast();
  const { role } = useAuth();
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false);

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

  const handleVideoSubmit = async (url: string) => {
    if (role === 'interested') {
      setShowRestrictedDialog(true);
      return;
    }

    setIsLoading(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      setCurrentVideo(url);
      toast({
        title: "Video loaded successfully",
        description: "Enjoy your distraction-free viewing experience!",
      });
    } catch (error) {
      toast({
        title: "Error loading video",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            <VideoOverlayButton
              config={overlayButtonConfig}
              onConfigChange={setOverlayButtonConfig}
            />
            <EmbedCodeGenerator 
              videoUrl={currentVideo} 
              playButtonColor={playButtonColor}
              playButtonSize={playButtonSize}
            />
            <TimedButton />
            <ExternalVideoScript />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feature available to users only</DialogTitle>
            <DialogDescription>
              To load and customize videos, please upgrade to a user account. For full access, contact us on Instagram.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="secondary" onClick={() => setShowRestrictedDialog(false)}>
              Close
            </Button>
            <Button onClick={() => window.open('https://www.instagram.com/askmoshbari/', '_blank', 'noopener,noreferrer')}>
              <Instagram className="mr-2 h-4 w-4" aria-hidden="true" />
              Contact on Instagram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
