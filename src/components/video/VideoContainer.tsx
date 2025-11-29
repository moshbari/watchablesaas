import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { VideoControls } from './VideoControls';
import { useVideoState } from './useVideoState';
import { useVideoEvents } from './useVideoEvents';
import { IsolatedYouTubePlayer } from './IsolatedYouTubePlayer';
import { GoogleDrivePlayer } from './GoogleDrivePlayer';
import { ResumeModal } from '../ResumeModal';
import { OverlayButton, type OverlayButtonConfig } from '../VideoOverlayButton';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { extractVideoUrl, isYouTubeUrl, getYouTubeId, isGoogleDriveUrl, getGoogleDriveId } from '@/lib/videoUtils';
import { FakeProgressBar } from './FakeProgressBar';

interface VideoContainerProps {
  src: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  overlayButtonConfig?: OverlayButtonConfig;
  startTime?: number;
  endTime?: number;
  fakeProgressEnabled?: boolean;
  fakeProgressColor?: string;
  fakeProgressThickness?: number;
  mobileFullscreenEnabled?: boolean;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({ 
  src, 
  onError, 
  playButtonColor = '#ff0000', 
  playButtonSize = 96,
  overlayButtonConfig,
  startTime,
  endTime,
  fakeProgressEnabled = false,
  fakeProgressColor = '#ef4444',
  fakeProgressThickness = 4,
  mobileFullscreenEnabled = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  
  // Extract the actual video URL (handles URLs with video parameters)
  const actualVideoUrl = useMemo(() => extractVideoUrl(src), [src]);
  
  const { savedProgress, saveProgress, clearProgress, showResumeModal, setShowResumeModal } = useVideoProgress(actualVideoUrl);
  
  // Detect if source is YouTube or Google Drive using the extracted URL
  const isYoutube = useMemo(() => isYouTubeUrl(actualVideoUrl), [actualVideoUrl]);
  const youtubeId = useMemo(() => isYoutube ? getYouTubeId(actualVideoUrl) : null, [isYoutube, actualVideoUrl]);
  const isGoogleDrive = useMemo(() => isGoogleDriveUrl(actualVideoUrl), [actualVideoUrl]);
  const googleDriveId = useMemo(() => isGoogleDrive ? getGoogleDriveId(actualVideoUrl) : null, [isGoogleDrive, actualVideoUrl]);

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
    if (isYoutube || isGoogleDrive) return; // YouTube/Google Drive handle their own play/pause
    
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        // If video has ended or is near the end, restart from start time
        if (videoRef.current.ended || 
            (endTime && videoRef.current.currentTime >= endTime) ||
            videoRef.current.currentTime >= videoRef.current.duration - 1) {
          videoRef.current.currentTime = startTime || 0;
        }
        videoRef.current.play();
      }
    }
  }, [state.isPlaying, isYoutube, isGoogleDrive, startTime, endTime]);

  const handleVolumeToggle = useCallback(() => {
    if (isYoutube || isGoogleDrive) return; // YouTube/Google Drive handle their own volume
    
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      setVolume(state.volume, newMuted);
    }
  }, [state.isMuted, state.volume, setVolume, isYoutube, isGoogleDrive]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (isYoutube || isGoogleDrive) return; // YouTube/Google Drive handle their own volume
    
    const volume = value[0] / 100;
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
      setVolume(volume, volume === 0);
    }
  }, [setVolume, isYoutube, isGoogleDrive]);

  const handleFullscreen = useCallback(() => {
    console.log('🎬 HTML5 Fullscreen clicked, mobile enabled:', mobileFullscreenEnabled);
    const isMobile = window.innerWidth < 768;
    
    // For mobile devices with native fullscreen support
    if (mobileFullscreenEnabled && videoRef.current && isMobile) {
      const video = videoRef.current;
      console.log('🎬 Attempting mobile video fullscreen');
      
      // iOS Safari uses webkitEnterFullscreen
      if ('webkitEnterFullscreen' in video && typeof (video as any).webkitEnterFullscreen === 'function') {
        try {
          console.log('🎬 Using webkitEnterFullscreen');
          (video as any).webkitEnterFullscreen();
          return;
        } catch (e) {
          console.log('🎬 webkitEnterFullscreen failed:', e);
        }
      }
      // Try video element fullscreen API
      if (video.requestFullscreen) {
        console.log('🎬 Using video.requestFullscreen');
        video.requestFullscreen();
        return;
      }
    }
    
    // Desktop or fallback to container fullscreen
    console.log('🎬 Using container fullscreen');
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [mobileFullscreenEnabled]);

  const handleResumeChoice = useCallback((shouldResume: boolean) => {
    console.log('🎬 Resume choice made:', shouldResume, 'saved progress:', savedProgress);
    setShowResumeModal(false);
    if (shouldResume && savedProgress) {
      if (isYoutube) {
        console.log('🎬 Setting shouldSeekTo for YouTube:', savedProgress);
        setShouldSeekTo(savedProgress);
      } else if (videoRef.current && !isGoogleDrive) {
        console.log('🎬 Setting currentTime for HTML5 video:', savedProgress);
        videoRef.current.currentTime = savedProgress;
      }
    }
  }, [savedProgress, isYoutube, isGoogleDrive, setShouldSeekTo, setShowResumeModal]);

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
    isYoutube: isYoutube || isGoogleDrive
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
    if (isYoutube || isGoogleDrive) return; // Skip for YouTube and Google Drive videos
    
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
      
      // Calculate and set video duration
      if (video.duration) {
        const effectiveDuration = endTime 
          ? endTime - (startTime || 0)
          : video.duration - (startTime || 0);
        setVideoDuration(effectiveDuration);
      }
      
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
  }, [saveProgress, onError, isYoutube, isGoogleDrive, startTime, endTime, hasInitialized, setLoading, setPlaying, setError]);

  // Initialize volume for HTML5 videos
  useEffect(() => {
    if (videoRef.current && !isYoutube && !isGoogleDrive) {
      videoRef.current.volume = state.volume;
    }
  }, [state.volume, isYoutube, isGoogleDrive]);

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
      <div className="relative w-full">
        <div 
          ref={containerRef}
          className={cn(
            "relative w-full aspect-video bg-player-bg border border-player-border rounded-lg overflow-hidden shadow-player group",
            state.isFullscreen && "rounded-none"
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseMove}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
        >
        {/* Video Element */}
        {isYoutube && youtubeId ? (
          <IsolatedYouTubePlayer
            videoId={youtubeId}
            onError={onError}
            playButtonColor={playButtonColor}
            playButtonSize={playButtonSize}
            startTime={startTime}
            endTime={endTime}
            onProgressUpdate={saveProgress}
            shouldSeekTo={state.shouldSeekTo}
            onSeekComplete={() => setShouldSeekTo(undefined)}
            onDurationChange={setVideoDuration}
            mobileFullscreenEnabled={mobileFullscreenEnabled}
          />
        ) : isGoogleDrive && googleDriveId ? (
          <GoogleDrivePlayer
            fileId={googleDriveId}
            onError={onError}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              src={actualVideoUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              playsInline
              webkit-playsinline="true"
              x-webkit-airplay="allow"
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

      {/* Fake Progress Bar - Positioned outside to avoid clipping */}
      {fakeProgressEnabled && (
        <div className="relative w-full" style={{ marginTop: `-${fakeProgressThickness || 8}px` }}>
          <FakeProgressBar
            videoDuration={videoDuration || 100}
            isPlaying={state.isPlaying}
            color={fakeProgressColor}
            thickness={fakeProgressThickness}
          />
        </div>
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