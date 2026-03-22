import { useState, useCallback } from 'react';

export interface SkipSection {
  from: number;
  to: number;
}

export interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  showControls: boolean;
  isLoading: boolean;
  error: string | null;
  shouldSeekTo?: number;
}

export const useVideoState = () => {
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isMuted: false,
    volume: 0.8,
    isFullscreen: false,
    showControls: true,
    isLoading: true,
    error: null
  });

  const updateState = useCallback((updates: Partial<VideoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setPlaying = useCallback((isPlaying: boolean) => {
    updateState({ isPlaying });
  }, [updateState]);

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  const setError = useCallback((error: string | null) => {
    updateState({ error, isLoading: false });
  }, [updateState]);

  const setVolume = useCallback((volume: number, isMuted: boolean) => {
    updateState({ volume, isMuted });
  }, [updateState]);

  const setFullscreen = useCallback((isFullscreen: boolean) => {
    updateState({ isFullscreen });
  }, [updateState]);

  const setShowControls = useCallback((showControls: boolean) => {
    updateState({ showControls });
  }, [updateState]);

  const setShouldSeekTo = useCallback((shouldSeekTo: number | undefined) => {
    updateState({ shouldSeekTo });
  }, [updateState]);

  return {
    state,
    updateState,
    setPlaying,
    setLoading,
    setError,
    setVolume,
    setFullscreen,
    setShowControls,
    setShouldSeekTo
  };
};