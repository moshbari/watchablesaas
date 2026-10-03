import { isYouTubeUrl } from './videoUtils';

const LOOKUP_TIMEOUT_MS = 10000;

/** What an empty title or headline becomes when the video's title can't be found. */
export const FALLBACK_VIDEO_TITLE = 'Watch This Video';

// One lookup per link: the builder checks a link as it's pasted, so by the time
// the page is saved its title is usually already here.
const cache = new Map<string, Promise<VideoCheck>>();

/**
 * - `ok`: the video can be played on a page.
 * - `embed-blocked`: the owner turned off embedding. It plays on YouTube, but no other site can play it.
 * - `unavailable`: private, deleted, or not a real video.
 * - `unknown`: we couldn't tell (other hosts, network trouble). Assume it's fine.
 */
export type VideoCheckStatus = 'ok' | 'embed-blocked' | 'unavailable' | 'unknown';

export interface VideoCheck {
  status: VideoCheckStatus;
  title: string | null;
}

/**
 * Asks the video host about a link: its title, and for YouTube whether it may be
 * played outside YouTube at all. YouTube's oEmbed endpoint answers browsers
 * directly and returns 401 exactly when the owner has disabled embedding.
 * Anything else goes through noembed (Vimeo, Wistia, …) for the title only.
 */
export const checkVideo = (url: string): Promise<VideoCheck> => {
  const trimmed = url.trim();
  const cached = cache.get(trimmed);
  if (cached) return cached;

  const lookup = lookupVideo(trimmed).then(result => {
    // A failed lookup (network trouble) shouldn't stick: let the next caller retry.
    if (result.status === 'unknown' && !result.title) cache.delete(trimmed);
    return result;
  });
  cache.set(trimmed, lookup);
  return lookup;
};

const lookupVideo = async (trimmed: string): Promise<VideoCheck> => {
  if (!trimmed) return { status: 'unknown', title: null };

  const youtube = isYouTubeUrl(trimmed);
  const endpoint = youtube
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(trimmed)}`
    : `https://noembed.com/embed?url=${encodeURIComponent(trimmed)}`;

  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) });
    if (youtube && (response.status === 401 || response.status === 403)) {
      return { status: 'embed-blocked', title: null };
    }
    if (youtube && (response.status === 400 || response.status === 404)) {
      return { status: 'unavailable', title: null };
    }
    if (!response.ok) return { status: 'unknown', title: null };

    const data = await response.json();
    const title = typeof data?.title === 'string' ? data.title.trim() : '';
    return { status: youtube ? 'ok' : 'unknown', title: title || null };
  } catch {
    return { status: 'unknown', title: null };
  }
};

/** The video's own title, or null when there is none to be had. Tries twice. */
export const fetchVideoTitle = async (url: string): Promise<string | null> =>
  (await checkVideo(url)).title ?? (await checkVideo(url)).title;

/** What to tell the page builder about a link that won't play. Null when it's fine. */
export const videoCheckWarning = (status: VideoCheckStatus): string | null => {
  switch (status) {
    case 'embed-blocked':
      return "YouTube won't play this video on your page: its owner has turned off embedding (or made it private). It only plays on YouTube itself. Pick a different video.";
    case 'unavailable':
      return 'This video is private, deleted, or the link is wrong, so it won\'t play on your page. Check the link or pick a different video.';
    default:
      return null;
  }
};
