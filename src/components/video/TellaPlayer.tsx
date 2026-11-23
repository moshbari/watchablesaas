import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Play } from 'lucide-react';

interface TellaPlayerProps {
  videoId: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  /** the video's picture, shown until the video is actually playing */
  posterUrl?: string;
}

/**
 * Tella video with ONE tap to play.
 *
 * Our picture + red button sit on top of Tella's player. Once Tella says it's
 * ready, they let taps fall straight through to Tella's player (a real tap inside
 * it starts playback with sound on every phone). A tap that comes before Tella is
 * ready is remembered, and we send Tella a "play" command the moment it's ready.
 * The picture disappears when Tella reports the video is playing.
 */
export const TellaPlayer: React.FC<TellaPlayerProps> = ({
  videoId,
  playButtonColor = '#ff0000',
  playButtonSize = 96,
  posterUrl
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [wantPlay, setWantPlay] = useState(false);
  const [posterOk, setPosterOk] = useState(true);

  const send = (type: string) => {
    try { iframeRef.current?.contentWindow?.postMessage({ type }, '*'); } catch { /* frame gone */ }
  };

  // Listen to this player's own messages: ready / playing.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data as { type?: string; state?: string; currentTime?: number } | null;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'ready') setReady(true);
      if ((d.type === 'timeUpdate' && (d.currentTime ?? 0) > 0) || (d.type === 'playbackState' && d.state === 'playing')) {
        setPlaying(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Tapped before Tella was ready → start it as soon as it is.
  useEffect(() => {
    if (ready && wantPlay && !playing) send('play');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, wantPlay]);

  // If the early-tap play was refused (some phones), drop the spinner so the next tap goes into Tella.
  useEffect(() => {
    if (!(ready && wantPlay) || playing) return;
    const t = setTimeout(() => setWantPlay(false), 2500);
    return () => clearTimeout(t);
  }, [ready, wantPlay, playing]);

  const showPoster = !!posterUrl && posterOk && !playing;
  const waiting = wantPlay && !playing;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
      <iframe
        ref={iframeRef}
        onLoad={() => send('hello')}
        src={`https://www.tella.tv/video/${videoId}/embed?b=0&title=0&a=0&loop=0&t=0&muted=0&wt=0`}
        className="w-full h-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {/* The video's own picture until it plays, so the box is never empty grey */}
      {showPoster && (
        <img
          src={posterUrl}
          alt=""
          onError={() => setPosterOk(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 15, pointerEvents: 'none' }}
        />
      )}

      {/* Our play button. Before Tella is ready it catches the tap; after, taps pass through to Tella. */}
      {!playing && (
        <div
          onClick={() => { if (!ready) setWantPlay(true); }}
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)', cursor: 'pointer',
            pointerEvents: ready ? 'none' : 'auto',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full shadow-xl"
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
        </div>
      )}

      {/* While playing: cover Tella's header and its bottom controls */}
      {playing && (
        <>
          <div
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', zIndex: 10, cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', zIndex: 10, cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}
    </div>
  );
};
