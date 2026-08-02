import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { loadYouTubeIframeAPI } from '@/lib/youtubeApi';
import { extractVideoUrl, getYouTubeId } from '@/lib/videoUtils';
import { getSegmentEngine, type VideoSegment } from '@/lib/videoSegments';
import { OverlayButton, type OverlayButtonConfig } from '../VideoOverlayButton';
import { FakeProgressBar } from './FakeProgressBar';

/**
 * Plays a list of trimmed video segments back-to-back in a single player frame.
 *
 * How it stays seamless: two stacked player slots. While slot A plays segment N,
 * slot B silently loads and buffers segment N+1, parked at its start time. At the
 * boundary we swap which slot is visible and unmute it — no iframe creation, no
 * network fetch, no seek at the moment it matters.
 *
 * iOS refuses to let a second video buffer while one is playing, so there we skip
 * pre-buffering and reuse the live player (loadVideoById), covering the load with a
 * short fade. Direct video files are seamless everywhere.
 */

const TICK_MS = 100;              // boundary resolution — the old 1s poll overshot cuts audibly
const PREBUFFER_LEAD_SECONDS = 8; // start loading the next segment this early
const FADE_MS = 180;

interface SequentialVideoPlayerProps {
  segments: VideoSegment[];
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  overlayButtonConfig?: OverlayButtonConfig;
  fakeProgressEnabled?: boolean;
  fakeProgressColor?: string;
  fakeProgressThickness?: number;
  mobileFullscreenEnabled?: boolean;
  /** Fires when the last segment finishes. */
  onSequenceEnd?: () => void;
}

type SlotKey = 0 | 1;

interface Slot {
  segmentIndex: number | null;
  engine: 'youtube' | 'html5' | null;
  yt: any | null;
  ytHost: HTMLDivElement | null;
  buffered: boolean;
  /** Guards against a slow mount landing after we moved on. */
  token: number;
}

const emptySlot = (): Slot => ({
  segmentIndex: null,
  engine: null,
  yt: null,
  ytHost: null,
  buffered: false,
  token: 0,
});

const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

export const SequentialVideoPlayer: React.FC<SequentialVideoPlayerProps> = ({
  segments,
  onError,
  playButtonColor = '#ff0000',
  playButtonSize = 96,
  overlayButtonConfig,
  fakeProgressEnabled = false,
  fakeProgressColor = '#ef4444',
  fakeProgressThickness = 4,
  mobileFullscreenEnabled = true,
  onSequenceEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([null, null]);
  const slots = useRef<[Slot, Slot]>([emptySlot(), emptySlot()]);
  const tokenCounter = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval>>();
  const advancingRef = useRef(false);
  const volumeRef = useRef(0.8);
  const mutedRef = useRef(false);
  const startedRef = useRef(false);

  const [activeSlot, setActiveSlot] = useState<SlotKey>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBridging, setIsBridging] = useState(false); // covering a non-prebuffered handoff
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  // Mirrors slots.current[].engine for rendering — a ref alone would not repaint,
  // leaving an empty <video> covering the YouTube iframe.
  const [slotEngines, setSlotEngines] = useState<Array<'youtube' | 'html5' | null>>([null, null]);

  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;
  const activeSlotRef = useRef<SlotKey>(0);
  activeSlotRef.current = activeSlot;

  const allowPrebuffer = !isIOS;

  /* ------------------------------------------------------------------ slots */

  const teardownSlot = useCallback((key: SlotKey) => {
    const slot = slots.current[key];
    if (slot.yt) {
      try { slot.yt.destroy(); } catch { /* already gone */ }
    }
    if (slot.ytHost && slot.ytHost.parentNode) {
      slot.ytHost.parentNode.removeChild(slot.ytHost);
    }
    const video = videoRefs.current[key];
    if (video) {
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch { /* detached */ }
    }
    slots.current[key] = emptySlot();
    setSlotEngines((prev) => {
      const next = [...prev];
      next[key] = null;
      return next;
    });
  }, []);

  const segmentStart = (segment: VideoSegment) => segment.start_time ?? 0;

  /**
   * Load a segment into a slot. `activate` means it plays immediately (audible);
   * otherwise it buffers silently, parked at its start time.
   */
  const mountSegment = useCallback(
    async (key: SlotKey, segmentIndex: number, activate: boolean) => {
      const segment = segmentsRef.current[segmentIndex];
      if (!segment) return;

      teardownSlot(key);
      const token = ++tokenCounter.current;
      const engine = getSegmentEngine(segment.video_url) === 'youtube' ? 'youtube' : 'html5';
      const start = segmentStart(segment);

      slots.current[key] = { ...emptySlot(), segmentIndex, engine, token };
      setSlotEngines((prev) => {
        const next = [...prev];
        next[key] = engine;
        return next;
      });

      if (engine === 'youtube') {
        const videoId = getYouTubeId(extractVideoUrl(segment.video_url));
        if (!videoId) {
          handleFatal('That YouTube link could not be read.');
          return;
        }

        try {
          await loadYouTubeIframeAPI();
        } catch {
          handleFatal('YouTube player failed to load.');
          return;
        }
        if (slots.current[key].token !== token) return; // superseded while loading

        const wrapper = wrapperRefs.current[key];
        if (!wrapper) return;
        const host = document.createElement('div');
        host.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
        wrapper.appendChild(host);
        slots.current[key].ytHost = host;

        const player = new window.YT.Player(host, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            start: Math.floor(start),
            // No `end` playerVar on purpose: we detect the boundary ourselves so the
            // handoff is ours to time, and YouTube's ENDED does not fight it.
          },
          events: {
            onReady: () => {
              if (slots.current[key].token !== token) return;
              slots.current[key].yt = player;
              try {
                if (activate) {
                  applyVolumeTo(key);
                  player.seekTo(start, true);
                  player.playVideo();
                } else {
                  // Force a real buffer: play muted, then park at the start frame.
                  player.mute();
                  player.seekTo(start, true);
                  player.playVideo();
                }
              } catch { /* player torn down mid-call */ }
            },
            onStateChange: (event: any) => {
              if (slots.current[key].token !== token) return;
              const playing = event.data === window.YT.PlayerState.PLAYING;

              if (!activate && playing && !slots.current[key].buffered) {
                // Buffered enough to have started — park it and wait for the handoff.
                slots.current[key].buffered = true;
                try {
                  player.pauseVideo();
                  player.seekTo(start, true);
                } catch { /* ignore */ }
                return;
              }

              if (activeSlotRef.current === key) {
                setIsPlaying(playing);
                if (playing) {
                  setIsLoading(false);
                  setIsBridging(false);
                }
              }
            },
            onError: () => {
              if (slots.current[key].token !== token) return;
              if (activeSlotRef.current === key) handleFatal('This video could not be played.');
            },
          },
        });

        slots.current[key].yt = player;
        return;
      }

      // Direct video file
      const video = videoRefs.current[key];
      if (!video) return;
      video.src = extractVideoUrl(segment.video_url);
      video.preload = 'auto';
      video.muted = activate ? mutedRef.current : true;
      video.load();

      // Seek before playing, or the first moments of the untrimmed head leak through.
      const onMetadata = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        if (slots.current[key].token !== token) return;
        try { video.currentTime = start; } catch { /* seek unsupported on this source */ }
        if (activate) {
          applyVolumeTo(key);
          video.play().catch(() => { /* awaiting gesture */ });
        }
      };
      video.addEventListener('loadedmetadata', onMetadata);

      if (activate) {
        applyVolumeTo(key);
      } else {
        // Nudge the decoder so the first frame is ready, then park.
        video
          .play()
          .then(() => {
            if (slots.current[key].token !== token) return;
            video.pause();
            try { video.currentTime = start; } catch { /* ignore */ }
            slots.current[key].buffered = true;
          })
          .catch(() => { /* blocked — preload="auto" still buffers */ });
      }
    },
    [teardownSlot]
  );

  const handleFatal = (message: string) => {
    setError(message);
    setIsLoading(false);
    onError?.(message);
  };

  /* ------------------------------------------------------- engine accessors */

  const applyVolumeTo = useCallback((key: SlotKey) => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube' && slot.yt) {
      try {
        if (mutedRef.current) slot.yt.mute();
        else { slot.yt.unMute(); slot.yt.setVolume(Math.round(volumeRef.current * 100)); }
      } catch { /* ignore */ }
    } else {
      const video = videoRefs.current[key];
      if (video) {
        video.muted = mutedRef.current;
        video.volume = volumeRef.current;
      }
    }
  }, []);

  const slotTime = (key: SlotKey): number | null => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      if (!slot.yt?.getCurrentTime) return null;
      try { return slot.yt.getCurrentTime(); } catch { return null; }
    }
    const video = videoRefs.current[key];
    return video ? video.currentTime : null;
  };

  const slotDuration = (key: SlotKey): number | null => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      if (!slot.yt?.getDuration) return null;
      try { return slot.yt.getDuration() || null; } catch { return null; }
    }
    const video = videoRefs.current[key];
    return video && Number.isFinite(video.duration) ? video.duration : null;
  };

  const slotSeek = (key: SlotKey, time: number) => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      try { slot.yt?.seekTo(time, true); } catch { /* ignore */ }
    } else {
      const video = videoRefs.current[key];
      if (video) { try { video.currentTime = time; } catch { /* ignore */ } }
    }
  };

  const slotPlay = (key: SlotKey) => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      try { slot.yt?.playVideo(); } catch { /* ignore */ }
    } else {
      videoRefs.current[key]?.play().catch(() => { /* ignore */ });
    }
  };

  const slotPause = (key: SlotKey) => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      try { slot.yt?.pauseVideo(); } catch { /* ignore */ }
    } else {
      videoRefs.current[key]?.pause();
    }
  };

  /* --------------------------------------------------------- the tick loop */

  const advance = useCallback(async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    const from = currentIndexRef.current;
    const next = from + 1;
    const active = activeSlotRef.current;

    if (next >= segmentsRef.current.length) {
      slotPause(active);
      setIsPlaying(false);
      setHasEnded(true);
      advancingRef.current = false;
      onSequenceEnd?.();
      return;
    }

    const other = (active === 0 ? 1 : 0) as SlotKey;
    const standby = slots.current[other];
    const prebuffered = standby.segmentIndex === next && standby.buffered;

    if (prebuffered) {
      // The whole point: the next segment is already decoded and parked.
      applyVolumeTo(other);
      slotSeek(other, segmentStart(segmentsRef.current[next]));
      slotPlay(other);
      setActiveSlot(other);
      activeSlotRef.current = other;
      setCurrentIndex(next);
      currentIndexRef.current = next;
      slotPause(active);
      // Free the old slot for the segment after this one.
      window.setTimeout(() => {
        if (currentIndexRef.current === next) {
          teardownSlot(active);
          if (next + 1 < segmentsRef.current.length && allowPrebuffer) {
            mountSegment(active, next + 1, false);
          }
        }
        advancingRef.current = false;
      }, FADE_MS * 2);
      return;
    }

    // Nothing pre-buffered (iOS, a very short segment, or a slow network):
    // load in place and cover the gap.
    setIsBridging(true);
    window.setTimeout(() => setIsBridging(false), 10000);
    slotPause(active);

    const nextSegment = segmentsRef.current[next];
    const nextIsYouTube = getSegmentEngine(nextSegment.video_url) === 'youtube';
    const activeSlotState = slots.current[active];

    if (nextIsYouTube && activeSlotState.engine === 'youtube' && activeSlotState.yt?.loadVideoById) {
      // Reusing the warm player beats building a new iframe, which matters most on iOS.
      const videoId = getYouTubeId(extractVideoUrl(nextSegment.video_url));
      if (videoId) {
        try {
          activeSlotState.segmentIndex = next;
          activeSlotState.buffered = false;
          applyVolumeTo(active);
          activeSlotState.yt.loadVideoById({ videoId, startSeconds: segmentStart(nextSegment) });
          setCurrentIndex(next);
          currentIndexRef.current = next;
          advancingRef.current = false;
          return;
        } catch { /* fall through to a fresh mount */ }
      }
    }

    await mountSegment(other, next, true);
    setActiveSlot(other);
    activeSlotRef.current = other;
    setCurrentIndex(next);
    currentIndexRef.current = next;
    teardownSlot(active);
    advancingRef.current = false;
  }, [allowPrebuffer, applyVolumeTo, mountSegment, onSequenceEnd, teardownSlot]);

  useEffect(() => {
    if (!hasStarted || hasEnded || error) return;

    tickRef.current = setInterval(() => {
      const active = activeSlotRef.current;
      const index = currentIndexRef.current;
      const segment = segmentsRef.current[index];
      if (!segment) return;

      const time = slotTime(active);
      if (time === null) return;

      // Skip sections first — a skip can land us past the end time.
      for (const skip of segment.skip_sections) {
        if (time >= skip.from && time < skip.to) {
          slotSeek(active, skip.to);
          return;
        }
      }

      const sourceDuration = slotDuration(active);
      const end = segment.end_time ?? (sourceDuration ? sourceDuration - 0.35 : undefined);

      if (end !== undefined && time >= end) {
        advance();
        return;
      }

      // Warm the next segment while this one is still playing.
      if (allowPrebuffer && end !== undefined && end - time <= PREBUFFER_LEAD_SECONDS) {
        const nextIndex = index + 1;
        const other = (active === 0 ? 1 : 0) as SlotKey;
        if (nextIndex < segmentsRef.current.length && slots.current[other].segmentIndex !== nextIndex) {
          mountSegment(other, nextIndex, false);
        }
      }
    }, TICK_MS);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [hasStarted, hasEnded, error, advance, allowPrebuffer, mountSegment]);

  // Direct video files report their own state — the YouTube path gets this from
  // onStateChange, and without it the loading veil would never lift on an MP4.
  useEffect(() => {
    const handlers: Array<() => void> = [];
    ([0, 1] as SlotKey[]).forEach((key) => {
      const video = videoRefs.current[key];
      if (!video) return;

      const onEnded = () => {
        if (activeSlotRef.current === key && hasStarted && !hasEnded) advance();
      };
      const onPlaying = () => {
        if (activeSlotRef.current !== key) return; // the standby slot is only buffering
        setIsPlaying(true);
        setIsLoading(false);
        setIsBridging(false);
      };
      const onPause = () => {
        if (activeSlotRef.current === key) setIsPlaying(false);
      };
      const onFailed = () => {
        if (activeSlotRef.current === key) handleFatal('This video could not be played.');
      };

      video.addEventListener('ended', onEnded);
      video.addEventListener('playing', onPlaying);
      video.addEventListener('pause', onPause);
      video.addEventListener('error', onFailed);
      handlers.push(() => {
        video.removeEventListener('ended', onEnded);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('error', onFailed);
      });
    });
    return () => handlers.forEach((off) => off());
  }, [advance, hasStarted, hasEnded]);

  /* ------------------------------------------------------------- lifecycle */

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      teardownSlot(0);
      teardownSlot(1);
    };
  }, [teardownSlot]);

  // Reset when the sequence itself changes (builder preview edits).
  const signature = segments.map((s) => `${s.video_url}|${s.start_time ?? ''}|${s.end_time ?? ''}`).join('~');
  useEffect(() => {
    teardownSlot(0);
    teardownSlot(1);
    startedRef.current = false;
    setActiveSlot(0);
    activeSlotRef.current = 0;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setHasStarted(false);
    setHasEnded(false);
    setIsPlaying(false);
    setError(null);
    setTotalDuration(0);
  }, [signature, teardownSlot]);

  /* --------------------------------------------------------------- controls */

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setIsLoading(true);
    setHasStarted(true);
    // Safety net: never leave the viewer staring at a black veil if a player
    // goes quiet without reporting an error.
    window.setTimeout(() => { setIsLoading(false); setIsBridging(false); }, 10000);
    await mountSegment(0, 0, true);
    setActiveSlot(0);
    activeSlotRef.current = 0;
    if (allowPrebuffer && segmentsRef.current.length > 1) {
      // Give the first segment a head start on the network before warming the second.
      window.setTimeout(() => {
        if (currentIndexRef.current === 0) mountSegment(1, 1, false);
      }, 2500);
    }
  }, [allowPrebuffer, mountSegment]);

  const handlePlayPause = useCallback(() => {
    if (hasEnded) {
      // Replay from the top.
      teardownSlot(0);
      teardownSlot(1);
      startedRef.current = false;
      setHasEnded(false);
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      start();
      return;
    }
    if (!hasStarted) {
      start();
      return;
    }
    if (isPlaying) {
      slotPause(activeSlotRef.current);
      setIsPlaying(false);
    } else {
      slotPlay(activeSlotRef.current);
      setIsPlaying(true);
    }
  }, [hasEnded, hasStarted, isPlaying, start, teardownSlot]);

  const handleVolumeToggle = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    applyVolumeTo(activeSlotRef.current);
  }, [applyVolumeTo]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const next = value[0];
    volumeRef.current = next / 100;
    mutedRef.current = next === 0;
    setVolumeState(next);
    setIsMuted(next === 0);
    applyVolumeTo(activeSlotRef.current);
  }, [applyVolumeTo]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  // Total run time for the fake progress bar, once every segment reports a length.
  useEffect(() => {
    if (!fakeProgressEnabled || !hasStarted) return;
    const known = segments.reduce((sum, s) => {
      if (s.end_time !== undefined) return sum + (s.end_time - (s.start_time ?? 0));
      return sum;
    }, 0);
    if (known > 0) setTotalDuration(known);
  }, [fakeProgressEnabled, hasStarted, segments]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-player-bg border border-player-border rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Video Error</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <center>
      <div className="relative w-full">
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-player-bg border border-player-border rounded-lg overflow-hidden shadow-player group"
          onMouseMove={() => setShowControls(true)}
          onTouchStart={() => setShowControls(true)}
        >
          {([0, 1] as SlotKey[]).map((key) => (
            <div
              key={key}
              ref={(el) => { wrapperRefs.current[key] = el; }}
              className="absolute inset-0 w-full h-full transition-opacity"
              style={{
                opacity: activeSlot === key ? 1 : 0,
                zIndex: activeSlot === key ? 2 : 1,
                transitionDuration: `${FADE_MS}ms`,
                pointerEvents: 'none',
              }}
            >
              <video
                ref={(el) => { videoRefs.current[key] = el; }}
                className={cn(
                  'absolute inset-0 w-full h-full object-contain',
                  slotEngines[key] !== 'html5' && 'hidden'
                )}
                playsInline
                webkit-playsinline="true"
                preload="auto"
              />
            </div>
          ))}

          {/* Covers a handoff we could not pre-buffer, so the swap reads as intentional. */}
          {(isLoading || isBridging) && (
            <div className="absolute inset-0 z-[5] bg-black flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
            </div>
          )}

          {/* Big play button before first start, and replay at the end. */}
          {(!hasStarted || hasEnded) && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
              <button
                onClick={handlePlayPause}
                className="rounded-full shadow-xl transition-transform duration-200 hover:scale-110 flex items-center justify-center"
                style={{
                  width: playButtonSize,
                  height: playButtonSize,
                  backgroundColor: playButtonColor,
                }}
                aria-label={hasEnded ? 'Replay' : 'Play'}
              >
                {hasEnded ? (
                  <RotateCcw className="text-white" style={{ width: playButtonSize * 0.4, height: playButtonSize * 0.4 }} />
                ) : (
                  <Play
                    className="text-white ml-1"
                    fill="currentColor"
                    style={{ width: playButtonSize * 0.4, height: playButtonSize * 0.4 }}
                  />
                )}
              </button>
            </div>
          )}

          {showControls && hasStarted && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-controls p-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handlePlayPause}>
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

                {segments.length > 1 && (
                  <span className="text-xs text-white/70 tabular-nums">
                    {currentIndex + 1} / {segments.length}
                  </span>
                )}

                <Button variant="ghost" size="icon" onClick={handleFullscreen}>
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {overlayButtonConfig && <OverlayButton config={overlayButtonConfig} onVideoContainer={true} />}
        </div>

        {fakeProgressEnabled && (
          <div className="relative w-full" style={{ marginTop: `-${fakeProgressThickness || 8}px` }}>
            <FakeProgressBar
              videoDuration={totalDuration || 100}
              isPlaying={isPlaying}
              color={fakeProgressColor}
              thickness={fakeProgressThickness}
            />
          </div>
        )}
      </div>
    </center>
  );
};
