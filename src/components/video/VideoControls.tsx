import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { VideoState } from './useVideoState';

interface VideoControlsProps {
  state: VideoState;
  onPlay: () => void;
  onVolumeToggle: () => void;
  onVolumeChange: (value: number[]) => void;
  onFullscreen: () => void;
  playButtonColor?: string;
  playButtonSize?: number;
  isYoutube?: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  state,
  onPlay,
  onVolumeToggle,
  onVolumeChange,
  onFullscreen,
  playButtonColor = '#ff0000',
  playButtonSize = 96,
  isYoutube = false
}) => {
  if (state.error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-player-bg">
        <div className="text-center">
          <p className="text-destructive mb-2">Video Error</p>
          <p className="text-muted-foreground text-sm">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-player-overlay flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-player-accent animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isYoutube ? "pointer-events-none" : "",
          state.showControls || !state.isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Play/Pause Center Button */}
        {!state.isPlaying && !state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlay}
              className="rounded-full border-0 shadow-xl transition-all duration-200 hover:scale-110 p-0"
              style={{
                width: `${playButtonSize}px`,
                height: `${playButtonSize}px`,
                backgroundColor: playButtonColor,
              }}
            >
              <div className="relative">
                <Play 
                  className="text-white ml-1" 
                  fill="currentColor" 
                  style={{ 
                    width: `${playButtonSize * 0.4}px`, 
                    height: `${playButtonSize * 0.4}px` 
                  }}
                />
              </div>
            </Button>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-controls p-4 pointer-events-auto">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlay}
              className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
            >
              {state.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" fill="currentColor" />
              )}
            </Button>

            {/* Volume Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onVolumeToggle}
                className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
              >
                {state.isMuted || state.volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[state.isMuted ? 0 : state.volume * 100]}
                  onValueChange={onVolumeChange}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreen}
              className="text-foreground hover:text-player-accent hover:bg-player-controls-hover"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};