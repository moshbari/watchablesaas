import { useMemo } from 'react';
import {
  extractVideoUrl,
  getGoogleDriveId,
  getTellaId,
  getUrlStartTime,
  getYouTubeId,
  isGoogleDriveUrl,
  isTellaUrl,
  isYouTubeUrl,
} from '@/lib/videoUtils';

/**
 * FAQ answer video. Unlike the page's main video (which hides the player's own
 * controls on purpose), FAQ videos use each provider's full player: pause, seek bar,
 * speed, captions, volume, fullscreen. Opens at the time written in the link (&t=163s).
 */
export const FaqVideo = ({ url }: { url: string }) => {
  const embed = useMemo(() => {
    const src = extractVideoUrl(url.trim());
    const start = Math.floor(getUrlStartTime(src) || 0);

    if (isYouTubeUrl(src) || /youtube\.com\/(?:shorts|live)\//.test(src)) {
      const id = getYouTubeId(src) || src.match(/youtube\.com\/(?:shorts|live)\/([^/?#&]+)/)?.[1];
      if (id) {
        const q = new URLSearchParams({ rel: '0', playsinline: '1', modestbranding: '1' });
        if (start) q.set('start', String(start));
        return { kind: 'iframe' as const, src: `https://www.youtube-nocookie.com/embed/${id}?${q}` };
      }
    }
    if (isGoogleDriveUrl(src)) {
      const id = getGoogleDriveId(src);
      if (id) return { kind: 'iframe' as const, src: `https://drive.google.com/file/d/${id}/preview` };
    }
    if (isTellaUrl(src)) {
      const id = getTellaId(src);
      if (id) return { kind: 'iframe' as const, src: `https://www.tella.tv/video/${id}/embed` };
    }
    const vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?/);
    if (vimeo) {
      const h = vimeo[2] ? `?h=${vimeo[2]}` : '';
      return { kind: 'iframe' as const, src: `https://player.vimeo.com/video/${vimeo[1]}${h}${start ? `#t=${start}s` : ''}` };
    }
    const loom = src.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (loom) {
      return { kind: 'iframe' as const, src: `https://www.loom.com/embed/${loom[1]}${start ? `?t=${start}` : ''}` };
    }
    // a video file link (mp4, mov, webm, ...)
    return { kind: 'video' as const, src: start ? `${src.split('#')[0]}#t=${start}` : src };
  }, [url]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm">
      {embed.kind === 'iframe' ? (
        <iframe
          src={embed.src}
          className="absolute inset-0 h-full w-full"
          title="FAQ video"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video src={embed.src} className="absolute inset-0 h-full w-full" controls playsInline preload="metadata" />
      )}
    </div>
  );
};
