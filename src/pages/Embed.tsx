import React, { useState, useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoActionButton } from '@/components/VideoActionButton';
import { type OverlayButtonConfig } from '@/components/VideoOverlayButton';
import { type SkipSection } from '@/components/video/useVideoState';
import { useToast } from '@/hooks/use-toast';

const Embed = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [endTime, setEndTime] = useState<number | undefined>(undefined);
  const [skipSections, setSkipSections] = useState<SkipSection[]>([]);
  const [playButtonColor, setPlayButtonColor] = useState('#ff0000');
  const [playButtonSize, setPlayButtonSize] = useState(96);
  const [overlayButtonConfig, setOverlayButtonConfig] = useState<OverlayButtonConfig>({
    enabled: false,
    text: 'Click Here to Secure Your Spot Now',
    url: 'https://example.com',
    delay: 3,
    position: 'top-right',
    width: '320px',
    height: '60px',
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
    const startParam = urlParams.get('startTime');
    const endParam = urlParams.get('endTime');
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
    if (startParam) {
      setStartTime(parseInt(startParam));
    }
    if (endParam) {
      setEndTime(parseInt(endParam));
    }

    // Parse skip sections from URL param (JSON array)
    const skipParam = urlParams.get('skipSections');
    if (skipParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(skipParam));
        if (Array.isArray(parsed)) {
          setSkipSections(parsed);
        }
      } catch (e) {
        console.log('Failed to parse skip sections:', e);
      }
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
    <div className="min-h-screen bg-background" style={{ margin: 0, padding: 0 }}>
      <VideoPlayer 
        src={currentVideo} 
        onError={handleVideoError}
        playButtonColor={playButtonColor}
        playButtonSize={playButtonSize}
        startTime={startTime}
        endTime={endTime}
      />
      
      {/* Action Button Below Video */}
      <VideoActionButton config={overlayButtonConfig} />
    </div>
  );
};

export default Embed;