import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface IsolatedYouTubePlayerProps {
  videoId: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  startTime?: number;
  endTime?: number;
  onProgressUpdate?: (currentTime: number) => void;
  shouldSeekTo?: number;
  onSeekComplete?: () => void;
  onDurationChange?: (duration: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const IsolatedYouTubePlayer: React.FC<IsolatedYouTubePlayerProps> = ({
  videoId,
  onError,
  playButtonColor = '#ff0000',
  playButtonSize = 96,
  startTime,
  endTime,
  onProgressUpdate,
  shouldSeekTo,
  onSeekComplete,
  onDurationChange
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const initializeTimeoutRef = useRef<NodeJS.Timeout>();

  // Load YouTube API and initialize player
  useEffect(() => {
    let isComponentMounted = true;

    const initializePlayer = () => {
      if (!isComponentMounted || !playerRef.current || ytPlayerRef.current) return;

      console.log('Creating isolated YouTube player for:', videoId);
      
      try {
        ytPlayerRef.current = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            autohide: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            start: startTime ? Math.floor(startTime) : 0,
            end: endTime ? Math.floor(endTime) : undefined
          },
          events: {
            onReady: () => {
              console.log('Isolated YouTube player ready');
              setIsLoading(false);
              if (ytPlayerRef.current) {
                ytPlayerRef.current.setVolume(volume);
                
                // Get and report video duration
                const duration = ytPlayerRef.current.getDuration();
                if (duration && onDurationChange) {
                  const effectiveDuration = endTime 
                    ? endTime - (startTime || 0)
                    : duration - (startTime || 0);
                  onDurationChange(effectiveDuration);
                }
              }
            },
            onStateChange: (event: any) => {
              // Only track essential state changes, no external callbacks
              const playing = event.data === window.YT.PlayerState.PLAYING;
              console.log('Isolated YouTube state:', event.data, playing);
              setIsPlaying(playing);
              
              if (playing) {
                startProgressTracking();
              } else {
                stopProgressTracking();
              }
            },
            onError: (event: any) => {
              console.error('Isolated YouTube player error:', event.data);
              setIsLoading(false);
              onError?.('YouTube video failed to load.');
            }
          }
        });
      } catch (error) {
        console.error('Error creating isolated YouTube player:', error);
        setIsLoading(false);
        onError?.('Failed to initialize YouTube player.');
      }
    };

    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        // Add small delay to prevent conflicts
        initializeTimeoutRef.current = setTimeout(initializePlayer, 100);
        return;
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = () => {
        if (isComponentMounted) {
          initializeTimeoutRef.current = setTimeout(initializePlayer, 100);
        }
      };
    };

    loadAPI();

    return () => {
      isComponentMounted = false;
      stopProgressTracking();
      if (initializeTimeoutRef.current) {
        clearTimeout(initializeTimeoutRef.current);
      }
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        console.log('Destroying isolated YouTube player');
        try {
          ytPlayerRef.current.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
        ytPlayerRef.current = null;
      }
    };
  }, [videoId]);

  // Handle seeking when shouldSeekTo changes
  useEffect(() => {
    if (shouldSeekTo !== undefined && ytPlayerRef.current && !isLoading) {
      try {
        console.log('🎬 Seeking to saved time:', shouldSeekTo);
        ytPlayerRef.current.seekTo(shouldSeekTo, true);
        // Start playing after seeking
        ytPlayerRef.current.playVideo();
        onSeekComplete?.();
      } catch (error) {
        console.error('Error seeking to saved time:', error);
        onSeekComplete?.();
      }
    }
  }, [shouldSeekTo, isLoading, onSeekComplete]);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;
    
    progressIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        try {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          onProgressUpdate?.(currentTime);
          
          // Check if we've reached the end time
          if (endTime && currentTime >= endTime) {
            console.log('YouTube end time reached, pausing video');
            ytPlayerRef.current.pauseVideo();
            stopProgressTracking();
          }
        } catch (error) {
          console.log('Error getting current time:', error);
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }
  };

  const handlePlay = () => {
    if (!ytPlayerRef.current) return;
    
    try {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        // Check if we need to seek to start time
        const currentTime = ytPlayerRef.current.getCurrentTime();
        const duration = ytPlayerRef.current.getDuration();
        
        // If video is at the beginning (0-5 seconds) or has ended, seek to start time
        if ((currentTime < 5 || 
             (endTime && currentTime >= endTime) ||
             currentTime >= duration - 2) && 
            startTime) {
          ytPlayerRef.current.seekTo(startTime, true);
        }
        
        ytPlayerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  };

  const handleVolumeToggle = () => {
    if (!ytPlayerRef.current) return;
    
    try {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error controlling volume:', error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!ytPlayerRef.current) return;
    
    try {
      const newVolume = value[0];
      setVolume(newVolume);
      ytPlayerRef.current.setVolume(newVolume);
      setIsMuted(newVolume === 0);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement && playerRef.current?.parentElement) {
      playerRef.current.parentElement.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* YouTube Player Container */}
      <div ref={playerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-player-overlay flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-player-accent animate-spin" />
        </div>
      )}

      {/* Custom Controls */}
      {showControls && (
        <div className="absolute inset-0 transition-opacity duration-300">
          {/* Center Play Button */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlay}
                className="rounded-full border-0 shadow-xl transition-all duration-200 hover:scale-110 p-0"
                style={{
                  width: `${playButtonSize}px`,
                  height: `${playButtonSize}px`,
                  backgroundColor: playButtonColor,
                }}
              >
                <Play 
                  className="text-white ml-1" 
                  fill="currentColor" 
                  style={{ 
                    width: `${playButtonSize * 0.4}px`, 
                    height: `${playButtonSize * 0.4}px` 
                  }}
                />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-controls p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handlePlay}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleVolumeToggle}>
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              <div className="flex-1" />

              <Button variant="ghost" size="icon" onClick={handleFullscreen}>
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};