import { newSegment, normaliseSegment, type VideoSegment } from './videoSegments';

/**
 * The builder edits times as separate HH/MM/SS text inputs; the database stores
 * plain seconds. These two shapes convert here so every builder agrees.
 */
export interface EditorSkip {
  fromHour: string; fromMinute: string; fromSecond: string;
  toHour: string; toMinute: string; toSecond: string;
}

export interface EditorVideo {
  id: string;
  video_url: string;
  startHour: string; startMinute: string; startSecond: string;
  endHour: string; endMinute: string; endSecond: string;
  skipSections: EditorSkip[];
}

export const timeToSeconds = (h: string, m: string, s: string): number =>
  (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);

export const secondsToTimeFields = (seconds?: number) => {
  if (!seconds || seconds <= 0) return { hours: '', minutes: '', seconds: '' };
  return {
    hours: String(Math.floor(seconds / 3600)),
    minutes: String(Math.floor((seconds % 3600) / 60)),
    seconds: String(Math.floor(seconds % 60)),
  };
};

export const emptyEditorVideo = (): EditorVideo => ({
  id: crypto.randomUUID(),
  video_url: '',
  startHour: '', startMinute: '', startSecond: '',
  endHour: '', endMinute: '', endSecond: '',
  skipSections: [],
});

export const emptyEditorSkip = (): EditorSkip => ({
  fromHour: '', fromMinute: '', fromSecond: '',
  toHour: '', toMinute: '', toSecond: '',
});

/** Any HH/MM/SS field filled in counts as "set"; all blank means "not set". */
const optionalSeconds = (h: string, m: string, s: string): number | undefined =>
  h || m || s ? timeToSeconds(h, m, s) : undefined;

export const editorVideoToSegment = (video: EditorVideo): VideoSegment => {
  const base = newSegment();
  return normaliseSegment({
    ...base,
    id: video.id,
    video_url: video.video_url.trim(),
    start_time: optionalSeconds(video.startHour, video.startMinute, video.startSecond),
    end_time: optionalSeconds(video.endHour, video.endMinute, video.endSecond),
    skip_sections: video.skipSections
      .map((s) => ({
        from: timeToSeconds(s.fromHour, s.fromMinute, s.fromSecond),
        to: timeToSeconds(s.toHour, s.toMinute, s.toSecond),
      }))
      .filter((s) => s.to > s.from),
  });
};

export const segmentToEditorVideo = (segment: VideoSegment): EditorVideo => {
  const start = secondsToTimeFields(segment.start_time);
  const end = secondsToTimeFields(segment.end_time);
  return {
    id: segment.id || crypto.randomUUID(),
    video_url: segment.video_url || '',
    startHour: start.hours, startMinute: start.minutes, startSecond: start.seconds,
    endHour: end.hours, endMinute: end.minutes, endSecond: end.seconds,
    skipSections: (segment.skip_sections || []).map((s) => {
      const from = secondsToTimeFields(s.from);
      const to = secondsToTimeFields(s.to);
      return {
        fromHour: from.hours, fromMinute: from.minutes, fromSecond: from.seconds,
        toHour: to.hours, toMinute: to.minutes, toSecond: to.seconds,
      };
    }),
  };
};
