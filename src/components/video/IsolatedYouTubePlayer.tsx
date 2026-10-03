import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { type SkipSection } from './useVideoState';
import { loadYouTubeIframeAPI, youTubeErrorMessage } from '@/lib/youtubeApi';

// If a play queued before the player was ready hasn't started by then, the browser
// refused to start it with sound — fall back to muted so the video still moves.
const QUEUED_PLAY_GRACE_MS = 2500;

interface IsolatedYouTubePlayerProps {
  videoId: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  startTime?: number;
  endTime?: number;
  skipSections?: SkipSection[];
  onProgressUpdate?: (currentTime: number) => void;
  shouldSeekTo?: number;
  onSeekComplete?: () => void;
  onDurationChange?: (duration: number) => void;
  mobileFullscreenEnabled?: boolean;
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
  skipSections = [],
  onProgressUpdate,
  shouldSeekTo,
  onSeekComplete,
  onDurationChange,
  mobileFullscreenEnabled = true
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  // The YouTube player boots in the background; viewers never wait on it. Until the
  // first frame plays they see the video's thumbnail and our play button.
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWaitingToPlay, setIsWaitingToPlay] = useState(false);
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [posterSrc, setPosterSrc] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
  const pendingPlayRef = useRef(false);
  const queuedPlayTimeoutRef = useRef<NodeJS.Timeout>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  // Detect iOS - fullscreen won't work on iOS Safari for YouTube (platform limitation)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

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
            controls: 0, // Always hide YouTube controls to prevent links
            disablekb: 1,
            fs: 0, // Disable YouTube's fullscreen button
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
              setIsReady(true);
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

                // The viewer tapped play while we were still booting.
                if (pendingPlayRef.current) playQueued();
              }
            },
            onStateChange: (event: any) => {
              // Only track essential state changes, no external callbacks
              const playing = event.data === window.YT.PlayerState.PLAYING;
              console.log('Isolated YouTube state:', event.data, playing);
              setIsPlaying(playing);
              
              if (playing) {
                pendingPlayRef.current = false;
                setHasStarted(true);
                setIsWaitingToPlay(false);
                startProgressTracking();
              } else {
                stopProgressTracking();
              }
            },
            onError: (event: any) => {
              console.error('Isolated YouTube player error:', event.data);
              pendingPlayRef.current = false;
              setIsWaitingToPlay(false);
              onError?.(youTubeErrorMessage(event.data));
            }
          }
        });
      } catch (error) {
        console.error('Error creating isolated YouTube player:', error);
        onError?.('Failed to initialize YouTube player.');
      }
    };

    // index.html starts fetching the API before the app bundle has even loaded,
    // so by now this usually resolves immediately.
    loadYouTubeIframeAPI()
      .then(initializePlayer)
      .catch((error) => {
        console.error(error);
        if (isComponentMounted) onError?.('YouTube video failed to load.');
      });

    return () => {
      isComponentMounted = false;
      stopProgressTracking();
      if (queuedPlayTimeoutRef.current) {
        clearTimeout(queuedPlayTimeoutRef.current);
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
    if (shouldSeekTo !== undefined && ytPlayerRef.current && isReady) {
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
  }, [shouldSeekTo, isReady, onSeekComplete]);

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
            return;
          }
          
          // Check skip sections - jump past if inside one
          for (const section of skipSections) {
            if (currentTime >= section.from && currentTime < section.to) {
              console.log(`YouTube: Skipping section ${section.from}-${section.to}, jumping to ${section.to}`);
              ytPlayerRef.current.seekTo(section.to, true);
              return;
            }
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

  /** Plays a tap that arrived before the player was ready. */
  const playQueued = () => {
    startPlayback();
    queuedPlayTimeoutRef.current = setTimeout(() => {
      const player = ytPlayerRef.current;
      if (!pendingPlayRef.current || !player) return;
      // Too long after the tap for the browser to count it — muted is always allowed.
      console.log('Queued play blocked, starting muted');
      try {
        player.mute();
        player.playVideo();
        setIsMuted(true);
        setNeedsUnmute(true);
      } catch (error) {
        console.error('Error starting muted playback:', error);
      }
    }, QUEUED_PLAY_GRACE_MS);
  };

  const handlePlay = () => {
    if (!ytPlayerRef.current || !isReady) {
      // Still booting: remember the tap and start the moment it's ready.
      pendingPlayRef.current = true;
      setIsWaitingToPlay(true);
      return;
    }

    if (isPlaying) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
      return;
    }

    startPlayback();
  };

  const startPlayback = () => {
    if (!ytPlayerRef.current) return;

    try {
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
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  };

  const handleUnmute = () => {
    if (!ytPlayerRef.current) return;
    try {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume(volume);
      setIsMuted(false);
      setNeedsUnmute(false);
    } catch (error) {
      console.error('Error unmuting:', error);
    }
  };

  const handleVolumeToggle = () => {
    if (!ytPlayerRef.current) return;
    setNeedsUnmute(false);
    
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
    // Try container fullscreen
    if (!document.fullscreenElement && playerRef.current?.parentElement) {
      playerRef.current.parentElement.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      className="relative w-full h-full"
      onTouchStart={() => setShowControls(true)}
    >
      {/* YouTube Player Container */}
      <div ref={playerRef} className="w-full h-full" />

      {/* Thumbnail until the first frame plays — shows instantly, covers the player booting */}
      {!hasStarted && (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover bg-black"
          // maxresdefault doesn't exist for every video; hqdefault always does
          onError={() => setPosterSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
        />
      )}

      {needsUnmute && (
        <button
          onClick={handleUnmute}
          className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          <VolumeX className="w-4 h-4" />
          Tap for sound
        </button>
      )}

      {/* Custom Controls */}
      {showControls && (
        <div className="absolute inset-0 transition-opacity duration-300">
          {/* Center Play Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handlePlay}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border-0 shadow-xl transition-all duration-200 hover:scale-110 p-0"
                style={{
                  width: `${playButtonSize}px`,
                  height: `${playButtonSize}px`,
                  backgroundColor: playButtonColor,
                }}
              >
                {isWaitingToPlay ? (
                  <Loader2
                    className="text-white animate-spin"
                    style={{
                      width: `${playButtonSize * 0.4}px`,
                      height: `${playButtonSize * 0.4}px`
                    }}
                  />
                ) : (
                  <Play 
                    className="text-white ml-1" 
                    fill="currentColor" 
                    style={{ 
                      width: `${playButtonSize * 0.4}px`, 
                      height: `${playButtonSize * 0.4}px` 
                    }}
                  />
                )}
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