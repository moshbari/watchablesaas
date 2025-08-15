import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { VideoControls } from './VideoControls';
import { useVideoState } from './useVideoState';
import { useVideoEvents } from './useVideoEvents';
import { YouTubePlayer } from '../YouTubePlayer';
import { ResumeModal } from '../ResumeModal';
import { OverlayButton, type OverlayButtonConfig } from '../VideoOverlayButton';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { extractVideoUrl, isYouTubeUrl, getYouTubeId } from '@/lib/videoUtils';

interface VideoContainerProps {
  src: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  overlayButtonConfig?: OverlayButtonConfig;
  startTime?: number;
  endTime?: number;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({ 
  src, 
  onError, 
  playButtonColor = '#ff0000', 
  playButtonSize = 96,
  overlayButtonConfig,
  startTime,
  endTime 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Extract the actual video URL (handles URLs with video parameters)
  const actualVideoUrl = useMemo(() => extractVideoUrl(src), [src]);
  
  const { savedProgress, saveProgress, clearProgress, showResumeModal, setShowResumeModal } = useVideoProgress(actualVideoUrl);
  
  // Detect if source is YouTube using the extracted URL
  const isYoutube = useMemo(() => isYouTubeUrl(actualVideoUrl), [actualVideoUrl]);
  const youtubeId = useMemo(() => isYoutube ? getYouTubeId(actualVideoUrl) : null, [isYoutube, actualVideoUrl]);

  const {
    state,
    setPlaying,
    setLoading,
    setError,
    setVolume,
    setFullscreen,
    setShowControls,
    setShouldSeekTo
  } = useVideoState();

  // Video event handlers for regular HTML5 videos
  const handlePlay = useCallback(() => {
    if (isYoutube) return; // YouTube handles its own play/pause
    
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [state.isPlaying, isYoutube]);

  const handleVolumeToggle = useCallback(() => {
    if (isYoutube) return; // YouTube handles its own volume
    
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setVolume(state.volume, newMuted);
    }
  }, [state.isMuted, state.volume, setVolume, isYoutube]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (isYoutube) return; // YouTube handles its own volume
    
    const volume = value[0] / 100;
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
      setVolume(volume, volume === 0);
    }
  }, [setVolume, isYoutube]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleResumeChoice = useCallback((shouldResume: boolean) => {
    setShowResumeModal(false);
    if (shouldResume && savedProgress) {
      if (isYoutube) {
        setShouldSeekTo(savedProgress);
      } else if (videoRef.current) {
        videoRef.current.currentTime = savedProgress;
      }
    }
  }, [savedProgress, isYoutube, setShouldSeekTo, setShowResumeModal]);

  // YouTube player event handlers - simplified to prevent feedback loops
  const handleYouTubeStateChange = useCallback((isPlaying: boolean) => {
    console.log('YouTube state change:', isPlaying);
    // Don't update our internal state for YouTube - let YouTube handle it
  }, []);

  const handleYouTubeVolumeChange = useCallback((volume: number, isMuted: boolean) => {
    setVolume(volume, isMuted);
  }, [setVolume]);

  const handleYouTubeError = useCallback((error: string) => {
    setError(error);
    onError?.(error);
  }, [setError, onError]);

  const { handleMouseMove, handleMouseLeave } = useVideoEvents({
    state,
    setPlaying,
    setShowControls,
    onPlay: handlePlay,
    onVolumeToggle: handleVolumeToggle,
    onFullscreen: handleFullscreen,
    isYoutube
  });

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setFullscreen]);

  // Video event listeners for HTML5 videos
  useEffect(() => {
    if (isYoutube) return; // Skip for YouTube videos
    
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handlePlaying = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleError = () => {
      const error = 'Failed to load video. Please check the URL and try again.';
      setError(error);
      onError?.(error);
    };

    // Progress saving and end time checking
    const handleTimeUpdate = () => {
      if (video.currentTime > 0) {
        // Check if we've reached the end time
        if (endTime && video.currentTime >= endTime) {
          console.log('End time reached, pausing video');
          video.pause();
          setPlaying(false);
          return;
        }
        saveProgress(video.currentTime);
      }
    };

    const handleLoadedData = () => {
      setLoading(false);
      
      if (!hasInitialized) {
        setHasInitialized(true);
        
        // Set start time if provided
        if (startTime && video) {
          video.currentTime = startTime;
        }
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [saveProgress, onError, isYoutube, startTime, endTime, hasInitialized, setLoading, setPlaying, setError]);

  // Initialize volume for HTML5 videos
  useEffect(() => {
    if (videoRef.current && !isYoutube) {
      videoRef.current.volume = state.volume;
    }
  }, [state.volume, isYoutube]);

  if (state.error) {
    return (
      <div className="w-full aspect-video bg-player-bg border border-player-border rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Video Error</p>
          <p className="text-muted-foreground text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <center>
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full aspect-video bg-player-bg border border-player-border rounded-lg overflow-hidden shadow-player group",
          state.isFullscreen && "rounded-none"
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Video Element */}
        {isYoutube && youtubeId ? (
          <YouTubePlayer
            videoId={youtubeId}
            onStateChange={handleYouTubeStateChange}
            onVolumeChange={handleYouTubeVolumeChange}
            onError={handleYouTubeError}
            savedProgress={savedProgress || undefined}
            onProgressUpdate={(currentTime: number) => {
              console.log('YouTube progress update:', currentTime);
              // Check if we've reached the end time for YouTube videos
              if (endTime && currentTime >= endTime) {
                console.log('End time reached for YouTube video');
              }
              saveProgress(currentTime);
            }}
            showControls={true}
            onFullscreen={handleFullscreen}
            playButtonColor={playButtonColor}
            playButtonSize={playButtonSize}
            shouldSeekTo={startTime && !hasInitialized ? startTime : undefined}
            onSeekComplete={() => setShouldSeekTo(undefined)}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={actualVideoUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              playsInline
            />

            <VideoControls
              state={state}
              onPlay={handlePlay}
              onVolumeToggle={handleVolumeToggle}
              onVolumeChange={handleVolumeChange}
              onFullscreen={handleFullscreen}
              playButtonColor={playButtonColor}
              playButtonSize={playButtonSize}
              isYoutube={false}
            />
          </>
        )}
        
        {/* Overlay Button */}
        {overlayButtonConfig && (
          <OverlayButton 
            config={overlayButtonConfig} 
            onVideoContainer={true}
          />
        )}
      </div>

      {/* Resume Modal - Works for both YouTube and HTML5 videos */}
      {showResumeModal && savedProgress && (
        <ResumeModal
          isOpen={showResumeModal}
          onChoice={handleResumeChoice}
          timestamp={savedProgress}
        />
      )}
    </center>
  );
};