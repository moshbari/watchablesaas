import React, { useEffect, useState, useRef } from 'react';

interface FakeProgressBarProps {
  videoDuration: number; // in seconds
  isPlaying: boolean;
  color?: string;
  thickness?: number;
  onComplete?: () => void;
}

// The fake "this video is short" bar: races to 75% in the first 30% of the time, then crawls
// through the last 25%. It stays hidden until the video first starts playing (not on page load)
// and only moves while the video is playing.
const calculateProgress = (elapsedMs: number, videoDuration: number): number => {
  if (videoDuration <= 0) return 0;
  const t = elapsedMs / (videoDuration * 1000);
  const eased = t < 0.3 ? t * 2.5 : 0.75 + (t - 0.3) * 0.357;
  return Math.min(eased * 100, 100);
};

export const FakeProgressBar: React.FC<FakeProgressBarProps> = ({
  videoDuration,
  isPlaying,
  color = '#ef4444',
  thickness = 8,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const elapsedRef = useRef(0); // ms of playing time so far
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // A new video (new length) starts the bar over, hidden again until it plays.
  useEffect(() => {
    elapsedRef.current = 0;
    setProgress(0);
    setStarted(false);
  }, [videoDuration]);

  useEffect(() => {
    if (!isPlaying || videoDuration <= 0) return;
    setStarted(true);
    let raf = 0;
    let last: number | null = null;
    const animate = (now: number) => {
      if (last !== null) elapsedRef.current += now - last;
      last = now;
      const p = calculateProgress(elapsedRef.current, videoDuration);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(animate);
      else onCompleteRef.current?.();
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, videoDuration]);

  if (!started) return null;

  return (
    <div
      className="w-full pointer-events-none overflow-hidden"
      style={{
        height: `${thickness}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '0 0 8px 8px',
        zIndex: 50,
        textAlign: 'left',
        display: 'block'
      }}
    >
      <div
        className="h-full"
        style={{
          width: `${progress || 1}%`,
          transition: 'width 0.1s linear',
          boxShadow: `0 0 15px ${color}`,
          background: color,
          float: 'left',
          clear: 'both'
        }}
      />
    </div>
  );
};
