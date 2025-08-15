import { useEffect, useRef, useCallback } from 'react';
import { VideoState } from './useVideoState';

interface UseVideoEventsProps {
  state: VideoState;
  setPlaying: (playing: boolean) => void;
  setShowControls: (show: boolean) => void;
  onPlay: () => void;
  onVolumeToggle: () => void;
  onFullscreen: () => void;
}

export const useVideoEvents = ({
  state,
  setPlaying,
  setShowControls,
  onPlay,
  onVolumeToggle,
  onFullscreen
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

  // Keyboard shortcuts
  useEffect(() => {
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
  }, [onPlay, onFullscreen, onVolumeToggle]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlaying(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setPlaying]);

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