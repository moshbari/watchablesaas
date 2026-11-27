import React, { useEffect, useState, useRef } from 'react';

interface FakeProgressBarProps {
  videoDuration: number; // in seconds (0 = not known yet)
  isPlaying: boolean;
  /** the video's real position in seconds, when the player reports it (YouTube, uploaded files) */
  currentTime?: number;
  color?: string;
  thickness?: number;
  onComplete?: () => void;
}

/*
 * The fake "this video is short" bar. It runs AHEAD of the video, then slows down so gradually nobody
 * notices, and finishes exactly when the video does — never before (viewers would stop trusting us).
 * Curve: ln(1 + 4t) / ln 5 → starts ~2.5× video speed, ~68% at the video's halfway point, ~0.5× speed
 * at the end, smooth all the way. Same curve as Forge's Video block.
 *
 * When the player reports its real position, the bar follows it (pausing, skipping and buffering
 * can't make it run off). When it can't (Google Drive, Tella, the multi-video player), the bar counts
 * play time and stops at 97% so it can't claim the end before the video gets there.
 * Hidden until the video first starts playing.
 */
const A = 4;
export const fakeCurve = (t: number) => Math.log(1 + A * Math.min(Math.max(t, 0), 1)) / Math.log(1 + A);

export const FakeProgressBar: React.FC<FakeProgressBarProps> = ({
  videoDuration,
  isPlaying,
  currentTime,
  color = '#ef4444',
  thickness = 8,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const elapsedRef = useRef(0); // ms of play, for players that don't report a position
  const reportRef = useRef<{ t: number; at: number } | null>(null);
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (typeof currentTime === 'number') reportRef.current = { t: currentTime, at: performance.now() };
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying) setStarted(true);
  }, [isPlaying]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = 0;
    let done = false;
    const animate = (now: number) => {
      const r = reportRef.current;
      let p: number;
      if (r && videoDuration > 0) {
        // Players report about once a second: glide in between, never more than 1.5s past the last report.
        const ahead = playingRef.current ? Math.min((now - r.at) / 1000, 1.5) : 0;
        p = fakeCurve((r.t + ahead) / videoDuration);
      } else {
        if (playingRef.current && last) elapsedRef.current += now - last;
        p = Math.min(0.97, fakeCurve(elapsedRef.current / ((videoDuration > 0 ? videoDuration : 100) * 1000)));
      }
      last = now;
      setProgress(p * 100);
      if (p >= 1 && !done) { done = true; onCompleteRef.current?.(); }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [started, videoDuration]);

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
        data-fake-bar
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
