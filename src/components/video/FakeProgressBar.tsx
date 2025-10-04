import React, { useEffect, useState, useRef } from 'react';

interface FakeProgressBarProps {
  videoDuration: number; // in seconds
  isPlaying: boolean;
  color?: string;
  thickness?: number;
  onComplete?: () => void;
}

export const FakeProgressBar: React.FC<FakeProgressBarProps> = ({
  videoDuration,
  isPlaying,
  color = '#ef4444',
  thickness = 4,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  // Debug logging
  useEffect(() => {
    console.log('🎬 FakeProgressBar mounted with:', { videoDuration, isPlaying, color, thickness });
  }, []);
  
  useEffect(() => {
    console.log('🎬 FakeProgressBar state changed:', { videoDuration, isPlaying, progress });
  }, [videoDuration, isPlaying, progress]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Calculate progress using an easing function that creates the illusion of speed
    const calculateProgress = (elapsedTime: number): number => {
      if (videoDuration <= 0) return 0;
      
      const normalizedTime = elapsedTime / (videoDuration * 1000); // Convert to 0-1 range
      
      // Easing function: starts fast (cubic easing), then slows down dramatically
      // This creates the psychological effect of a fast, small video
      const eased = normalizedTime < 0.3 
        ? normalizedTime * 2.5 // First 30% of time, progress 75% faster
        : 0.75 + (normalizedTime - 0.3) * 0.357; // Remaining 70% of time fills last 25%
      
      return Math.min(eased * 100, 100);
    };

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime - pausedTimeRef.current;
      }

      const elapsedTime = currentTime - startTimeRef.current;
      const newProgress = calculateProgress(elapsedTime);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (startTimeRef.current !== null) {
        pausedTimeRef.current = performance.now() - startTimeRef.current;
      }
    };
  }, [isPlaying, videoDuration, onComplete]);

  // Reset when video duration changes
  useEffect(() => {
    setProgress(0);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [videoDuration]);

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 pointer-events-none"
      style={{ 
        height: `${thickness}px`,
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.3)' // Dark semi-transparent track
      }}
    >
      <div 
        className="h-full transition-all duration-200 ease-linear"
        style={{
          width: `${Math.max(progress, 5)}%`, // Always show at least 5%
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`
        }}
      />
    </div>
  );
};
