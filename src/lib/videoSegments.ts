import { isYouTubeUrl, isGoogleDriveUrl, isTellaUrl, extractVideoUrl } from './videoUtils';
import { type SkipSection } from '@/components/video/useVideoState';

/**
 * One video in a sequence. Same shape as multivideo_pages.videos so both
 * builders speak the same language.
 */
export interface VideoSegment {
  id: string;
  title?: string;
  video_url: string;
  video_type: string;
  start_time?: number;
  end_time?: number;
  skip_sections: SkipSection[];
}

/** Sources we can drive programmatically, so we know when one segment ends. */
export type SegmentEngine = 'youtube' | 'html5' | 'unsupported';

/**
 * Google Drive and Tella are plain iframes with no JS API — we cannot read their
 * current time, so we cannot trim them or detect the end to advance the sequence.
 * (That is also why start/end/skip already do nothing for those two today.)
 */
export const getSegmentEngine = (url: string): SegmentEngine => {
  const actual = extractVideoUrl(url || '');
  if (isYouTubeUrl(actual)) return 'youtube';
  if (isGoogleDriveUrl(actual) || isTellaUrl(actual)) return 'unsupported';
  return 'html5';
};

export const canSequence = (url: string) => getSegmentEngine(url) !== 'unsupported';

export const newSegment = (): VideoSegment => ({
  id: crypto.randomUUID(),
  title: '',
  video_url: '',
  video_type: 'youtube',
  start_time: undefined,
  end_time: undefined,
  skip_sections: [],
});

/** Segments with a usable URL, in order. */
export const playableSegments = (segments: VideoSegment[] | null | undefined): VideoSegment[] =>
  (segments || []).filter((s) => s && typeof s.video_url === 'string' && s.video_url.trim().length > 0);

/**
 * Read a page's video sequence.
 *
 * `videos` wins when it has entries; otherwise we synthesise a single segment from
 * the legacy flat columns so pages built before this feature keep working untouched.
 */
export const segmentsFromPage = (page: {
  videos?: unknown;
  video_url?: string | null;
  video_type?: string | null;
  start_time?: number | null;
  end_time?: number | null;
  skip_sections?: unknown;
}): VideoSegment[] => {
  const raw = Array.isArray(page?.videos) ? (page.videos as VideoSegment[]) : [];
  const fromVideos = playableSegments(raw).map(normaliseSegment);
  if (fromVideos.length > 0) return fromVideos;

  if (!page?.video_url) return [];
  return [
    normaliseSegment({
      id: 'legacy',
      video_url: page.video_url,
      video_type: page.video_type || 'youtube',
      start_time: page.start_time ?? undefined,
      end_time: page.end_time ?? undefined,
      skip_sections: Array.isArray(page.skip_sections) ? (page.skip_sections as SkipSection[]) : [],
    }),
  ];
};

/** Defensive: jsonb from the DB is untyped, and bad trims break playback silently. */
export const normaliseSegment = (segment: VideoSegment): VideoSegment => {
  const start = numberOrUndefined(segment.start_time);
  let end = numberOrUndefined(segment.end_time);
  // An end at or before the start would make the segment zero-length and stall the sequence.
  if (start !== undefined && end !== undefined && end <= start) end = undefined;

  const skips = (Array.isArray(segment.skip_sections) ? segment.skip_sections : [])
    .map((s) => ({ from: Number(s?.from), to: Number(s?.to) }))
    .filter((s) => Number.isFinite(s.from) && Number.isFinite(s.to) && s.to > s.from)
    .sort((a, b) => a.from - b.from);

  return {
    id: segment.id || crypto.randomUUID(),
    title: segment.title || '',
    video_url: segment.video_url,
    video_type: segment.video_type || (getSegmentEngine(segment.video_url) === 'youtube' ? 'youtube' : 'direct'),
    start_time: start,
    end_time: end,
    skip_sections: skips,
  };
};

const numberOrUndefined = (value: unknown): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/**
 * Playing length of a segment, minus anything skipped inside the played window.
 * `sourceDuration` is the untrimmed length; without it an open-ended segment
 * has no knowable length and returns undefined.
 */
export const segmentPlayDuration = (
  segment: VideoSegment,
  sourceDuration?: number
): number | undefined => {
  const start = segment.start_time ?? 0;
  const end = segment.end_time ?? sourceDuration;
  if (end === undefined || !Number.isFinite(end)) return undefined;

  const skipped = segment.skip_sections.reduce((total, s) => {
    const from = Math.max(s.from, start);
    const to = Math.min(s.to, end);
    return to > from ? total + (to - from) : total;
  }, 0);

  return Math.max(0, end - start - skipped);
};

/** Total sequence length; undefined as soon as any segment's length is unknown. */
export const sequenceDuration = (
  segments: VideoSegment[],
  sourceDurations: Record<string, number> = {}
): number | undefined => {
  let total = 0;
  for (const segment of segments) {
    const d = segmentPlayDuration(segment, sourceDurations[segment.id]);
    if (d === undefined) return undefined;
    total += d;
  }
  return total;
};
