import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface TellaPlayerProps {
  videoId: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  /** the video's picture, shown until the video is actually playing */
  posterUrl?: string;
}

const formatTime = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${String(m).padStart(2, '0')}:${sec}`;
};

/**
 * Tella video with our own controls.
 *
 * Our layer always sits over Tella's player and takes every tap and mouse move, so
 * Tella's own control bar (which shows the video's TOTAL length) never appears.
 * We drive Tella through its message API (play / pause / mute) and show only the
 * time watched so far, like the phone player. One tap on the red button plays.
 *
 * Safety net: if a play command is refused (some phones), our layer steps aside so
 * the next tap lands on Tella's own player.
 */
export const TellaPlayer: React.FC<TellaPlayerProps> = ({
  videoId,
  playButtonColor = '#ff0000',
  playButtonSize = 96,
  posterUrl
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [wantPlay, setWantPlay] = useState(false);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const [barVisible, setBarVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [passThrough, setPassThrough] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const send = useCallback((type: string) => {
    try { iframeRef.current?.contentWindow?.postMessage({ type }, '*'); } catch { /* frame gone */ }
  }, []);

  // Tella's messages: ready / playbackState / timeUpdate
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data as { type?: string; state?: string; currentTime?: number } | null;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'ready') setReady(true);
      if (d.type === 'timeUpdate' && typeof d.currentTime === 'number') {
        setTime(d.currentTime);
        if (d.currentTime > 0) setStarted(true);
      }
      if (d.type === 'playbackState') {
        if (d.state === 'playing') { setPlaying(true); setStarted(true); setWantPlay(false); }
        else if (d.state === 'paused' || d.state === 'ended' || d.state === 'idle') setPlaying(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // A tap before Tella was ready → play the moment it is.
  const playSent = useRef(false);
  useEffect(() => {
    if (ready && wantPlay && !playSent.current) { playSent.current = true; send('play'); }
  }, [ready, wantPlay, send]);

  // Play refused (nothing started 3s after asking) → let the next tap reach Tella's own player.
  useEffect(() => {
    if (!(ready && wantPlay) || started) return;
    const t = setTimeout(() => { setWantPlay(false); playSent.current = false; setPassThrough(true); }, 3000);
    return () => clearTimeout(t);
  }, [ready, wantPlay, started]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const pokeBar = () => {
    setBarVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBarVisible(false), 2500);
  };
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const togglePlay = () => {
    if (!started && !playing) {
      // the effect below sends 'play' once Tella is ready (never twice: Tella toggles on a second 'play')
      if (!wantPlay) setWantPlay(true);
      return;
    }
    if (playing) { send('pause'); setPlaying(false); }
    else { send('play'); setPlaying(true); }
    pokeBar();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    send(muted ? 'unmute' : 'mute');
    setMuted(!muted);
    pokeBar();
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen?.();
    else wrapRef.current?.requestFullscreen?.();
  };

  const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  const showPoster = !!posterUrl && posterOk && !started;
  const waiting = wantPlay && !started;
  const showBigButton = !started || (!playing && !waiting);

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}
      onMouseMove={started ? pokeBar : undefined}
    >
      <iframe
        ref={iframeRef}
        onLoad={() => send('hello')}
        src={`https://www.tella.tv/video/${videoId}/embed?b=0&title=0&a=0&loop=0&t=0&muted=0&wt=0`}
        className="w-full h-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {showPoster && (
        <img
          src={posterUrl}
          alt=""
          onError={() => setPosterOk(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 15, pointerEvents: 'none' }}
        />
      )}

      {/* Our layer: takes every tap and mouse move so Tella's own bar never shows */}
      <div
        onClick={togglePlay}
        style={{
          position: 'absolute', inset: 0, zIndex: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          // paused: Tella shows its own bar + buttons underneath, so dim harder
          backgroundColor: !started ? 'rgba(0, 0, 0, 0.3)' : showBigButton ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
          pointerEvents: passThrough && !started ? 'none' : 'auto',
          transition: 'background-color 0.2s ease',
        }}
      >
        {showBigButton || waiting ? (
          <div
            className="flex items-center justify-center rounded-full shadow-xl transition-transform duration-200 hover:scale-110"
            style={{ width: playButtonSize, height: playButtonSize, backgroundColor: playButtonColor }}
          >
            {waiting ? (
              <Loader2 className="text-white animate-spin" style={{ width: playButtonSize * 0.4, height: playButtonSize * 0.4 }} />
            ) : (
              <Play
                className="text-white fill-white"
                style={{ width: playButtonSize * 0.45, height: playButtonSize * 0.45, marginLeft: playButtonSize * 0.08 }}
              />
            )}
          </div>
        ) : null}
      </div>

      {/* Our control bar: time watched only — never the total length */}
      {started && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 25, opacity: barVisible || !playing ? 1 : 0, minHeight: playing ? undefined : 'max(20%, 60px)' }}
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-end gap-3 px-3 pb-2 text-white transition-opacity duration-300',
            // paused: solid, so Tella's own bar (with the total length) underneath can't show through
            playing ? 'bg-gradient-to-t from-black/70 to-transparent pt-8' : 'bg-black'
          )}
        >
          <button type="button" onClick={(e) => { e.stopPropagation(); togglePlay(); }} aria-label={playing ? 'Pause' : 'Play'} className="p-1">
            {playing ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
          </button>
          <span className="text-sm font-medium tabular-nums">{formatTime(time)}</span>
          <div className="flex-1" />
          <button type="button" onClick={toggleMute} aria-label={muted ? 'Sound on' : 'Mute'} className="p-1">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          {canFullscreen && (
            <button type="button" onClick={toggleFullscreen} aria-label="Full screen" className="p-1">
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
