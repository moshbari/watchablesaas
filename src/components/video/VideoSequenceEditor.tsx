import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, ListVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputWithClipboard } from '@/components/InputWithClipboard';
import { canSequence } from '@/lib/videoSegments';
import {
  emptyEditorSkip,
  emptyEditorVideo,
  type EditorSkip,
  type EditorVideo,
} from '@/lib/videoTimeFields';

interface VideoSequenceEditorProps {
  videos: EditorVideo[];
  onChange: (videos: EditorVideo[]) => void;
}

const timeFieldClass = 'w-20 text-center border-2 border-foreground/80 rounded-lg';
const smallTimeFieldClass = 'w-14 text-center text-xs border-2 border-foreground/80 rounded-lg px-1';

/**
 * Edits the ordered list of videos that play back-to-back on a page.
 * Each entry keeps the same trim + skip controls a single video has always had.
 */
export const VideoSequenceEditor: React.FC<VideoSequenceEditorProps> = ({ videos, onChange }) => {
  const list = videos.length > 0 ? videos : [emptyEditorVideo()];

  const updateVideo = (index: number, patch: Partial<EditorVideo>) => {
    onChange(list.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const addVideo = () => onChange([...list, emptyEditorVideo()]);

  const removeVideo = (index: number) => {
    const next = list.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [emptyEditorVideo()]);
  };

  const moveVideo = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const updateSkip = (videoIndex: number, skipIndex: number, field: keyof EditorSkip, value: string) => {
    const video = list[videoIndex];
    updateVideo(videoIndex, {
      skipSections: video.skipSections.map((s, i) => (i === skipIndex ? { ...s, [field]: value } : s)),
    });
  };

  const addSkip = (videoIndex: number) => {
    const video = list[videoIndex];
    updateVideo(videoIndex, { skipSections: [...video.skipSections, emptyEditorSkip()] });
  };

  const removeSkip = (videoIndex: number, skipIndex: number) => {
    const video = list[videoIndex];
    updateVideo(videoIndex, { skipSections: video.skipSections.filter((_, i) => i !== skipIndex) });
  };

  const filledCount = list.filter((v) => v.video_url.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Videos (Optional)</Label>
        {filledCount > 1 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListVideo className="w-3.5 h-3.5" />
            {filledCount} videos play in order
          </span>
        )}
      </div>

      {list.map((video, index) => {
        const sequencable = !video.video_url.trim() || canSequence(video.video_url);
        const showSequenceWarning = !sequencable && list.length > 1;

        return (
          <div key={video.id} className="space-y-4 p-4 rounded-lg border bg-background">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {list.length > 1 ? `Video ${index + 1}` : 'Video URL (Optional)'}
              </Label>
              {list.length > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                    onClick={() => moveVideo(index, -1)} disabled={index === 0} aria-label="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                    onClick={() => moveVideo(index, 1)} disabled={index === list.length - 1} aria-label="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button" variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeVideo(index)} aria-label="Remove video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <InputWithClipboard
              id={`video_url_${index}`}
              value={video.video_url}
              onValueChange={(value) => updateVideo(index, { video_url: value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="border-2 border-foreground/80 rounded-lg"
            />

            {showSequenceWarning && (
              <div className="flex gap-2 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs">
                  Google Drive and Tella videos cannot be chained — they give us no way to tell when
                  playback ends, which is also why trimming and skipping do not work on them. Use a
                  YouTube link or a direct MP4 for videos in a sequence.
                </p>
              </div>
            )}

            {video.video_url && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <Label className="text-sm font-medium">Time Range (Optional)</Label>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Start Time</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="number" placeholder="HH" min="0" max="23" className={timeFieldClass}
                        value={video.startHour}
                        onChange={(e) => updateVideo(index, { startHour: e.target.value })} />
                      <span className="text-muted-foreground font-bold">:</span>
                      <Input type="number" placeholder="MM" min="0" max="59" className={timeFieldClass}
                        value={video.startMinute}
                        onChange={(e) => updateVideo(index, { startMinute: e.target.value })} />
                      <span className="text-muted-foreground font-bold">:</span>
                      <Input type="number" placeholder="SS" min="0" max="59" className={timeFieldClass}
                        value={video.startSecond}
                        onChange={(e) => updateVideo(index, { startSecond: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">End Time</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="number" placeholder="HH" min="0" max="23" className={timeFieldClass}
                        value={video.endHour}
                        onChange={(e) => updateVideo(index, { endHour: e.target.value })} />
                      <span className="text-muted-foreground font-bold">:</span>
                      <Input type="number" placeholder="MM" min="0" max="59" className={timeFieldClass}
                        value={video.endMinute}
                        onChange={(e) => updateVideo(index, { endMinute: e.target.value })} />
                      <span className="text-muted-foreground font-bold">:</span>
                      <Input type="number" placeholder="SS" min="0" max="59" className={timeFieldClass}
                        value={video.endSecond}
                        onChange={(e) => updateVideo(index, { endSecond: e.target.value })} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {list.length > 1
                    ? 'Leave empty to play this video in full before moving to the next one. End time must be after start time.'
                    : 'Leave empty to play the full video. End time must be after start time.'}
                </p>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Skip Sections</Label>
                    <Button type="button" variant="outline" size="sm" className="gap-1"
                      onClick={() => addSkip(index)}>
                      <Plus className="w-3 h-3" /> Add Skip
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Define sections to skip during playback. The player will seamlessly jump over these parts.
                  </p>

                  {video.skipSections.map((section, skipIndex) => (
                    <div key={skipIndex} className="space-y-2 p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Skip #{skipIndex + 1}</span>
                        <Button type="button" variant="ghost" size="sm"
                          className="h-6 px-2 text-destructive hover:text-destructive"
                          onClick={() => removeSkip(index, skipIndex)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <div className="flex gap-1 items-center">
                            <Input type="number" placeholder="HH" min="0" max="23" className={smallTimeFieldClass}
                              value={section.fromHour}
                              onChange={(e) => updateSkip(index, skipIndex, 'fromHour', e.target.value)} />
                            <span className="text-muted-foreground text-xs">:</span>
                            <Input type="number" placeholder="MM" min="0" max="59" className={smallTimeFieldClass}
                              value={section.fromMinute}
                              onChange={(e) => updateSkip(index, skipIndex, 'fromMinute', e.target.value)} />
                            <span className="text-muted-foreground text-xs">:</span>
                            <Input type="number" placeholder="SS" min="0" max="59" className={smallTimeFieldClass}
                              value={section.fromSecond}
                              onChange={(e) => updateSkip(index, skipIndex, 'fromSecond', e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <div className="flex gap-1 items-center">
                            <Input type="number" placeholder="HH" min="0" max="23" className={smallTimeFieldClass}
                              value={section.toHour}
                              onChange={(e) => updateSkip(index, skipIndex, 'toHour', e.target.value)} />
                            <span className="text-muted-foreground text-xs">:</span>
                            <Input type="number" placeholder="MM" min="0" max="59" className={smallTimeFieldClass}
                              value={section.toMinute}
                              onChange={(e) => updateSkip(index, skipIndex, 'toMinute', e.target.value)} />
                            <span className="text-muted-foreground text-xs">:</span>
                            <Input type="number" placeholder="SS" min="0" max="59" className={smallTimeFieldClass}
                              value={section.toSecond}
                              onChange={(e) => updateSkip(index, skipIndex, 'toSecond', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" onClick={addVideo} className="w-full gap-2">
        <Plus className="w-4 h-4" /> Add Another Video
      </Button>

      <p className="text-xs text-muted-foreground">
        Videos play one after another in this order, in the same player. Each one keeps its own
        start time, end time and skipped sections.
      </p>
    </div>
  );
};
