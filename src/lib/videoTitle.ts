import { isYouTubeUrl } from './videoUtils';

const LOOKUP_TIMEOUT_MS = 5000;

/**
 * Looks up a video's own title so a page saved with just a video URL still gets a
 * real headline. YouTube's oEmbed endpoint answers browsers directly; anything
 * else goes through noembed (Vimeo, Wistia, …). Returns null when there is no
 * title to be had — callers decide the fallback.
 */
export const fetchVideoTitle = async (url: string): Promise<string | null> => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const endpoint = isYouTubeUrl(trimmed)
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(trimmed)}`
    : `https://noembed.com/embed?url=${encodeURIComponent(trimmed)}`;

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) });
    if (!response.ok) return null;
    const data = await response.json();
    const title = typeof data?.title === 'string' ? data.title.trim() : '';
    return title || null;
  } catch {
    return null;
  }
};
