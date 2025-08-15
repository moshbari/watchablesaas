import { useEffect, useRef, useCallback } from 'react';
import { VideoState } from './useVideoState';

interface UseVideoEventsProps {
  state: VideoState;
  setPlaying: (playing: boolean) => void;
  setShowControls: (show: boolean) => void;
  onPlay: () => void;
  onVolumeToggle: () => void;
  onFullscreen: () => void;
  isYoutube?: boolean;
}

export const useVideoEvents = ({
  state,
  setPlaying,
  setShowControls,
  onPlay,
  onVolumeToggle,
  onFullscreen,
  isYoutube = false
}: UseVideoEventsProps) => {
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, [setShowControls]);

  const handleMouseMove = useCallback(() => {
    if (state.isPlaying) {
      showControlsTemporarily();
    }
  }, [state.isPlaying, showControlsTemporarily]);

  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying) {
      setShowControls(false);
    }
  }, [state.isPlaying, setShowControls]);

  // Keyboard shortcuts - skip for YouTube videos to avoid conflicts
  useEffect(() => {
    if (isYoutube) return; // Skip keyboard shortcuts for YouTube
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlay();
          break;
        case 'KeyF':
          e.preventDefault();
          onFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          onVolumeToggle();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onPlay, onFullscreen, onVolumeToggle, isYoutube]);

  // Fullscreen change listener - skip for YouTube to avoid state conflicts
  useEffect(() => {
    if (isYoutube) return; // Skip for YouTube to avoid state conflicts
    
    const handleFullscreenChange = () => {
      setPlaying(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setPlaying, isYoutube]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleMouseMove,
    handleMouseLeave
  };
};