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
 * Two stacked slots, each owning a YouTube player that is created once and then
 * REUSED for every segment it shows. Rebuilding the iframe per segment costs one
 * to three seconds of player boot on its own, which is the difference between a
 * clean cut and a spinner. Swapping content with loadVideoById keeps the player warm.
 *
 * While slot A plays segment N, slot B loads segment N+1 muted, lets it buffer, then
 * parks it on its start frame. The handoff is a visibility swap plus an unmute.
 *
 * iOS will not buffer a second video while one plays, so there we reuse the live
 * player and cover the load. `mode="button"` sidesteps the problem entirely: the
 * viewer clicks Continue, and that gesture lets the next video start immediately.
 */

const TICK_MS = 100;               // boundary resolution — a 1s poll overshoots cuts audibly
const PREBUFFER_AFTER_MS = 1200;   // let the playing segment claim bandwidth first
const BUFFER_ASSUME_MS = 6000;     // treat a silent pre-buffer as ready even if it never reports
const FADE_MS = 180;

export type BetweenVideosMode = 'auto' | 'button';

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
  /** 'auto' chains straight through; 'button' waits for a Continue click at each cut. */
  mode?: BetweenVideosMode;
  continueButtonText?: string;
  continueButtonBgColor?: string;
  continueButtonTextColor?: string;
  onSequenceEnd?: () => void;
}

type SlotKey = 0 | 1;

interface Slot {
  segmentIndex: number | null;
  engine: 'youtube' | 'html5' | null;
  activate: boolean;
  buffered: boolean;
  token: number;
}

const emptySlot = (): Slot => ({
  segmentIndex: null,
  engine: null,
  activate: false,
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
  mode = 'auto',
  continueButtonText = 'Continue Watching',
  continueButtonBgColor = '#3b82f6',
  continueButtonTextColor = '#ffffff',
  onSequenceEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([null, null]);
  /** Persistent across segments — this is what keeps transitions fast. */
  const ytPlayers = useRef<Array<any | null>>([null, null]);
  const ytHosts = useRef<Array<HTMLDivElement | null>>([null, null]);
  const ytReady = useRef<Array<boolean>>([false, false]);
  const slots = useRef<[Slot, Slot]>([emptySlot(), emptySlot()]);
  const pendingMount = useRef<Array<(() => void) | null>>([null, null]);

  const tokenCounter = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval>>();
  const advancingRef = useRef(false);
  const volumeRef = useRef(0.8);
  const mutedRef = useRef(false);
  const startedRef = useRef(false);
  const activeStartedAt = useRef(0);

  const [activeSlot, setActiveSlot] = useState<SlotKey>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [slotEngines, setSlotEngines] = useState<Array<'youtube' | 'html5' | null>>([null, null]);

  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;
  const activeSlotRef = useRef<SlotKey>(0);
  activeSlotRef.current = activeSlot;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const allowPrebuffer = !isIOS;

  const handleFatal = useCallback((message: string) => {
    setError(message);
    setIsLoading(false);
    setIsBridging(false);
    onError?.(message);
  }, [onError]);

  const setEngine = (key: SlotKey, engine: 'youtube' | 'html5' | null) => {
    setSlotEngines((prev) => {
      if (prev[key] === engine) return prev;
      const next = [...prev];
      next[key] = engine;
      return next;
    });
  };

  const segmentStart = (segment: VideoSegment) => segment.start_time ?? 0;

  /* ------------------------------------------------------- engine accessors */

  const applyVolumeTo = useCallback((key: SlotKey) => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      const player = ytPlayers.current[key];
      if (!player) return;
      try {
        if (mutedRef.current) player.mute();
        else { player.unMute(); player.setVolume(Math.round(volumeRef.current * 100)); }
      } catch { /* player busy */ }
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
      const player = ytPlayers.current[key];
      if (!player?.getCurrentTime) return null;
      try { return player.getCurrentTime(); } catch { return null; }
    }
    const video = videoRefs.current[key];
    return video ? video.currentTime : null;
  };

  const slotDuration = (key: SlotKey): number | null => {
    const slot = slots.current[key];
    if (slot.engine === 'youtube') {
      const player = ytPlayers.current[key];
      if (!player?.getDuration) return null;
      try { return player.getDuration() || null; } catch { return null; }
    }
    const video = videoRefs.current[key];
    return video && Number.isFinite(video.duration) ? video.duration : null;
  };

  const slotSeek = (key: SlotKey, time: number) => {
    if (slots.current[key].engine === 'youtube') {
      try { ytPlayers.current[key]?.seekTo(time, true); } catch { /* ignore */ }
    } else {
      const video = videoRefs.current[key];
      if (video) { try { video.currentTime = time; } catch { /* ignore */ } }
    }
  };

  const slotPlay = (key: SlotKey) => {
    if (slots.current[key].engine === 'youtube') {
      try { ytPlayers.current[key]?.playVideo(); } catch { /* ignore */ }
    } else {
      videoRefs.current[key]?.play().catch(() => { /* ignore */ });
    }
  };

  const slotPause = (key: SlotKey) => {
    if (slots.current[key].engine === 'youtube') {
      try { ytPlayers.current[key]?.pauseVideo(); } catch { /* ignore */ }
    } else {
      videoRefs.current[key]?.pause();
    }
  };

  /* ------------------------------------------------------- player creation */

  /** Creates a slot's YouTube player once; later segments reuse it. */
  const ensureYouTubePlayer = useCallback(async (key: SlotKey, firstVideoId: string, firstStart: number) => {
    if (ytPlayers.current[key]) return ytPlayers.current[key];

    try {
      await loadYouTubeIframeAPI();
    } catch {
      handleFatal('YouTube player failed to load.');
      return null;
    }

    if (ytPlayers.current[key]) return ytPlayers.current[key];

    const wrapper = wrapperRefs.current[key];
    if (!wrapper) return null;

    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    wrapper.appendChild(host);
    ytHosts.current[key] = host;

    return await new Promise<any>((resolve) => {
      const player = new window.YT.Player(host, {
        videoId: firstVideoId,
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
          start: Math.floor(firstStart),
          // No `end` playerVar on purpose: we time the handoff ourselves.
        },
        events: {
          onReady: () => {
            ytReady.current[key] = true;
            resolve(player);
            const queued = pendingMount.current[key];
            pendingMount.current[key] = null;
            queued?.();
          },
          onStateChange: (event: any) => {
            const slot = slots.current[key];
            const playing = event.data === window.YT.PlayerState.PLAYING;

            // A silent pre-buffer has started fetching: park it on its start frame.
            if (!slot.activate && playing && !slot.buffered) {
              slot.buffered = true;
              const segment = segmentsRef.current[slot.segmentIndex ?? -1];
              try {
                player.pauseVideo();
                if (segment) player.seekTo(segmentStart(segment), true);
              } catch { /* ignore */ }
              return;
            }

            if (activeSlotRef.current === key && slot.activate) {
              setIsPlaying(playing);
              if (playing) {
                setIsLoading(false);
                setIsBridging(false);
              }
            }
          },
          onError: () => {
            if (activeSlotRef.current === key) handleFatal('This video could not be played.');
          },
        },
      });
      ytPlayers.current[key] = player;
    });
  }, [handleFatal]);

  /**
   * Point a slot at a segment. `activate` plays it audibly now; otherwise it loads
   * muted in the background and parks on its start frame, ready for the handoff.
   */
  const mountSegment = useCallback(
    async (key: SlotKey, segmentIndex: number, activate: boolean) => {
      const segment = segmentsRef.current[segmentIndex];
      if (!segment) return;

      const token = ++tokenCounter.current;
      const engine = getSegmentEngine(segment.video_url) === 'youtube' ? 'youtube' : 'html5';
      const start = segmentStart(segment);

      slots.current[key] = { segmentIndex, engine, activate, buffered: false, token };
      setEngine(key, engine);

      if (engine === 'youtube') {
        const videoId = getYouTubeId(extractVideoUrl(segment.video_url));
        if (!videoId) {
          if (activate) handleFatal('That YouTube link could not be read.');
          return;
        }

        const existing = ytPlayers.current[key];
        if (!existing) {
          // First use of this slot — the player boots straight onto this segment.
          const player = await ensureYouTubePlayer(key, videoId, start);
          if (!player || slots.current[key].token !== token) return;
          try {
            if (activate) {
              applyVolumeTo(key);
              player.playVideo();
            } else {
              player.mute();
              player.playVideo();
            }
          } catch { /* ignore */ }
        } else {
          const load = () => {
            if (slots.current[key].token !== token) return;
            try {
              if (activate) applyVolumeTo(key);
              else existing.mute();
              // Reusing the warm player — no iframe rebuild, no player boot.
              existing.loadVideoById({ videoId, startSeconds: start });
            } catch { /* ignore */ }
          };
          if (ytReady.current[key]) load();
          else pendingMount.current[key] = load;
        }

        if (!activate) {
          // If the buffering player never reports back, do not let that force the
          // slow path at the cut — assume it is warm enough and swap anyway.
          window.setTimeout(() => {
            if (slots.current[key].token === token) slots.current[key].buffered = true;
          }, BUFFER_ASSUME_MS);
        }
        return;
      }

      // Direct video file
      const video = videoRefs.current[key];
      if (!video) return;
      video.src = extractVideoUrl(segment.video_url);
      video.preload = 'auto';
      video.muted = activate ? mutedRef.current : true;
      video.load();

      // Seek before playing, or the untrimmed head leaks through.
      const onMetadata = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        if (slots.current[key].token !== token) return;
        try { video.currentTime = start; } catch { /* seek unsupported */ }
        if (activate) {
          applyVolumeTo(key);
          video.play().catch(() => { /* awaiting gesture */ });
        } else {
          video.play()
            .then(() => {
              if (slots.current[key].token !== token) return;
              video.pause();
              try { video.currentTime = start; } catch { /* ignore */ }
              slots.current[key].buffered = true;
            })
            .catch(() => { slots.current[key].buffered = true; });
        }
      };
      video.addEventListener('loadedmetadata', onMetadata);
    },
    [applyVolumeTo, ensureYouTubePlayer, handleFatal]
  );

  /* ------------------------------------------------------------- advancing */

  const goToSegment = useCallback(async (next: number) => {
    const active = activeSlotRef.current;
    const other = (active === 0 ? 1 : 0) as SlotKey;
    const standby = slots.current[other];
    const ready = standby.segmentIndex === next && standby.buffered;

    if (ready) {
      // The point of the whole design: already loaded and parked.
      standby.activate = true;
      applyVolumeTo(other);
      slotPlay(other);
      setActiveSlot(other);
      activeSlotRef.current = other;
      setCurrentIndex(next);
      currentIndexRef.current = next;
      activeStartedAt.current = Date.now();
      slots.current[active].activate = false;
      slotPause(active);
      advancingRef.current = false;
      return;
    }

    // Not pre-buffered (iOS, a very short clip, or a slow network).
    setIsBridging(true);
    window.setTimeout(() => setIsBridging(false), 12000);
    slots.current[active].activate = false;
    slotPause(active);

    await mountSegment(other, next, true);
    setActiveSlot(other);
    activeSlotRef.current = other;
    setCurrentIndex(next);
    currentIndexRef.current = next;
    activeStartedAt.current = Date.now();
    advancingRef.current = false;
  }, [applyVolumeTo, mountSegment]);

  const reachedEndOfSegment = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    const next = currentIndexRef.current + 1;

    if (next >= segmentsRef.current.length) {
      slotPause(activeSlotRef.current);
      setIsPlaying(false);
      setHasEnded(true);
      advancingRef.current = false;
      onSequenceEnd?.();
      return;
    }

    if (modeRef.current === 'button') {
      // Hold on the last frame and let the viewer choose to go on.
      slotPause(activeSlotRef.current);
      setIsPlaying(false);
      setAwaitingContinue(true);
      advancingRef.current = false;
      return;
    }

    goToSegment(next);
  }, [goToSegment, onSequenceEnd]);

  const handleContinue = useCallback(() => {
    setAwaitingContinue(false);
    advancingRef.current = true;
    goToSegment(currentIndexRef.current + 1);
  }, [goToSegment]);

  /* --------------------------------------------------------- the tick loop */

  useEffect(() => {
    if (!hasStarted || hasEnded || error || awaitingContinue) return;

    tickRef.current = setInterval(() => {
      const active = activeSlotRef.current;
      const index = currentIndexRef.current;
      const segment = segmentsRef.current[index];
      if (!segment) return;

      const time = slotTime(active);
      if (time === null) return;

      for (const skip of segment.skip_sections) {
        if (time >= skip.from && time < skip.to) {
          slotSeek(active, skip.to);
          return;
        }
      }

      const sourceDuration = slotDuration(active);
      const end = segment.end_time ?? (sourceDuration ? sourceDuration - 0.35 : undefined);

      if (end !== undefined && time >= end) {
        reachedEndOfSegment();
        return;
      }

      // Start the next segment loading as early as possible. Waiting until the end
      // is near leaves no lead time at all on short clips.
      if (allowPrebuffer && Date.now() - activeStartedAt.current > PREBUFFER_AFTER_MS) {
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
  }, [hasStarted, hasEnded, error, awaitingContinue, reachedEndOfSegment, allowPrebuffer, mountSegment]);

  /* ------------------------------------------ direct-file state reporting */

  useEffect(() => {
    const handlers: Array<() => void> = [];
    ([0, 1] as SlotKey[]).forEach((key) => {
      const video = videoRefs.current[key];
      if (!video) return;

      const onEnded = () => {
        if (activeSlotRef.current === key && hasStarted && !hasEnded) reachedEndOfSegment();
      };
      const onPlaying = () => {
        if (activeSlotRef.current !== key || !slots.current[key].activate) return;
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
  }, [reachedEndOfSegment, hasStarted, hasEnded, handleFatal]);

  /* ------------------------------------------------------------- lifecycle */

  const destroyEverything = useCallback(() => {
    ([0, 1] as SlotKey[]).forEach((key) => {
      const player = ytPlayers.current[key];
      if (player?.destroy) {
        try { player.destroy(); } catch { /* already gone */ }
      }
      ytPlayers.current[key] = null;
      ytReady.current[key] = false;
      pendingMount.current[key] = null;
      const host = ytHosts.current[key];
      if (host?.parentNode) host.parentNode.removeChild(host);
      ytHosts.current[key] = null;

      const video = videoRefs.current[key];
      if (video) {
        try { video.pause(); video.removeAttribute('src'); video.load(); } catch { /* detached */ }
      }
      slots.current[key] = emptySlot();
    });
    setSlotEngines([null, null]);
  }, []);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      destroyEverything();
    };
  }, [destroyEverything]);

  // Rebuild when the sequence itself changes (builder preview edits).
  const signature = segments.map((s) => `${s.video_url}|${s.start_time ?? ''}|${s.end_time ?? ''}`).join('~');
  useEffect(() => {
    destroyEverything();
    startedRef.current = false;
    setActiveSlot(0);
    activeSlotRef.current = 0;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setHasStarted(false);
    setHasEnded(false);
    setAwaitingContinue(false);
    setIsPlaying(false);
    setIsLoading(false);
    setIsBridging(false);
    setError(null);
    setTotalDuration(0);
  }, [signature, destroyEverything]);

  /* --------------------------------------------------------------- controls */

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setIsLoading(true);
    setHasStarted(true);
    activeStartedAt.current = Date.now();
    window.setTimeout(() => { setIsLoading(false); setIsBridging(false); }, 12000);
    await mountSegment(0, 0, true);
    setActiveSlot(0);
    activeSlotRef.current = 0;
  }, [mountSegment]);

  const restart = useCallback(() => {
    destroyEverything();
    startedRef.current = false;
    setActiveSlot(0);
    activeSlotRef.current = 0;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setHasEnded(false);
    setAwaitingContinue(false);
    window.setTimeout(() => start(), 0);
  }, [destroyEverything, start]);

  const handlePlayPause = useCallback(() => {
    if (hasEnded) { restart(); return; }
    if (awaitingContinue) { handleContinue(); return; }
    if (!hasStarted) { start(); return; }
    if (isPlaying) {
      slotPause(activeSlotRef.current);
      setIsPlaying(false);
    } else {
      slotPlay(activeSlotRef.current);
      setIsPlaying(true);
    }
  }, [hasEnded, awaitingContinue, hasStarted, isPlaying, restart, handleContinue, start]);

  const handleVolumeToggle = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setIsMuted(mutedRef.current);
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

  useEffect(() => {
    if (!fakeProgressEnabled || !hasStarted) return;
    const known = segments.reduce(
      (sum, s) => (s.end_time !== undefined ? sum + (s.end_time - (s.start_time ?? 0)) : sum),
      0
    );
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

          {/* Hides YouTube's own spinner and branding during a load we could not hide. */}
          {(isLoading || isBridging) && (
            <div className="absolute inset-0 z-[5] bg-black flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
            </div>
          )}

          {awaitingContinue && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
              <button
                onClick={handleContinue}
                className="px-8 py-4 rounded-lg font-semibold text-lg shadow-xl transition-transform duration-200 hover:scale-105"
                style={{ backgroundColor: continueButtonBgColor, color: continueButtonTextColor }}
              >
                {continueButtonText}
              </button>
            </div>
          )}

          {(!hasStarted || hasEnded) && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
              <button
                onClick={handlePlayPause}
                className="rounded-full shadow-xl transition-transform duration-200 hover:scale-110 flex items-center justify-center"
                style={{ width: playButtonSize, height: playButtonSize, backgroundColor: playButtonColor }}
                aria-label={hasEnded ? 'Replay' : 'Play'}
              >
                {hasEnded ? (
                  <RotateCcw className="text-white" style={{ width: playButtonSize * 0.4, height: playButtonSize * 0.4 }} />
                ) : (
                  <Play className="text-white ml-1" fill="currentColor"
                    style={{ width: playButtonSize * 0.4, height: playButtonSize * 0.4 }} />
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
                    <Slider value={[isMuted ? 0 : volume]} onValueChange={handleVolumeChange} max={100} step={1} />
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
