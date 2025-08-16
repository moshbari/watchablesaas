import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoActionButton } from '@/components/VideoActionButton';
import { type OverlayButtonConfig } from '@/components/VideoOverlayButton';
import { useToast } from '@/hooks/use-toast';

const Embed = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [playButtonColor, setPlayButtonColor] = useState('#ff0000');
  const [playButtonSize, setPlayButtonSize] = useState(96);
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

  // Check for video parameter in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('video');
    const colorParam = urlParams.get('playButtonColor');
    const sizeParam = urlParams.get('playButtonSize');
    const buttonText = urlParams.get('buttonText');
    const buttonUrl = urlParams.get('buttonUrl');
    const buttonEnabled = urlParams.get('buttonEnabled');
    
    if (videoParam) {
      setCurrentVideo(decodeURIComponent(videoParam));
    }
    if (colorParam) {
      setPlayButtonColor(decodeURIComponent(colorParam));
    }
    if (sizeParam) {
      setPlayButtonSize(parseInt(sizeParam) || 96);
    }
    
    // Configure overlay button from URL params
    if (buttonEnabled === 'true' && buttonText && buttonUrl) {
      setOverlayButtonConfig(prev => ({
        ...prev,
        enabled: true,
        text: decodeURIComponent(buttonText),
        url: decodeURIComponent(buttonUrl)
      }));
    }
  }, []);

  const handleVideoError = (error: string) => {
    toast({
      title: "Video Error",
      description: error,
      variant: "destructive",
    });
  };

  if (!currentVideo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">No video specified</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VideoPlayer 
        src={currentVideo} 
        onError={handleVideoError}
        playButtonColor={playButtonColor}
        playButtonSize={playButtonSize}
      />
      
      {/* Action Button Below Video */}
      <VideoActionButton config={overlayButtonConfig} />
    </div>
  );
};

export default Embed;