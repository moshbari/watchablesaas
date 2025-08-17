import React, { useState } from 'react';
import { Play, Link, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validateVideoUrl } from '@/lib/videoUtils';

interface VideoUrlInputProps {
  onVideoSubmit: (url: string, startTime?: number, endTime?: number) => void;
  isLoading?: boolean;
  isEditing?: boolean;
  initialUrl?: string;
  initialStartTime?: number;
  initialEndTime?: number;
}

export const VideoUrlInput: React.FC<VideoUrlInputProps> = ({ 
  onVideoSubmit, 
  isLoading, 
  isEditing = false, 
  initialUrl = '', 
  initialStartTime,
  initialEndTime 
}) => {
  const secondsToTime = (seconds?: number) => {
    if (!seconds) return { hours: '', minutes: '', seconds: '' };
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h > 0 ? h.toString() : '',
      minutes: m > 0 ? m.toString() : '',
      seconds: s > 0 ? s.toString() : ''
    };
  };

  const initialStart = secondsToTime(initialStartTime);
  const initialEnd = secondsToTime(initialEndTime);

  const [url, setUrl] = useState(initialUrl);
  const [urlType, setUrlType] = useState<'youtube' | 'direct'>('youtube');
  const [startHour, setStartHour] = useState(initialStart.hours);
  const [startMinute, setStartMinute] = useState(initialStart.minutes);
  const [startSecond, setStartSecond] = useState(initialStart.seconds);
  const [endHour, setEndHour] = useState(initialEnd.hours);
  const [endMinute, setEndMinute] = useState(initialEnd.minutes);
  const [endSecond, setEndSecond] = useState(initialEnd.seconds);

  const validateUrl = (input: string): boolean => {
    try {
      const url = new URL(input);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const isYouTubeUrl = (input: string): boolean => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(input);
  };

  const timeToSeconds = (hours: string, minutes: string, seconds: string): number => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    return h * 3600 + m * 60 + s;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    if (!validateUrl(url)) {
      // Simple validation feedback could be added here
      return;
    }

    const startTime = (startHour || startMinute || startSecond) ? timeToSeconds(startHour, startMinute, startSecond) : undefined;
    const endTime = (endHour || endMinute || endSecond) ? timeToSeconds(endHour, endMinute, endSecond) : undefined;

    onVideoSubmit(url.trim(), startTime, endTime);
  };

  const exampleUrls = {
    youtube: [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    direct: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
      'https://webinarkit.com/video/player?url=https%3A%2F%2Fexample.com%2Fvideo.mp4'
    ]
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-card border-player-border shadow-player">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
            <Play className="w-6 h-6 text-player-accent" fill="currentColor" />
            Distraction-Free Video Player
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter a YouTube URL, direct video file, or video player page - we'll automatically extract the video
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={urlType} onValueChange={(value) => setUrlType(value as 'youtube' | 'direct')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                YouTube URL
              </TabsTrigger>
              <TabsTrigger value="direct" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Direct Video File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">YouTube Video URL</Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-input border-player-border"
                  />
                </div>
                
                {/* Time Controls */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-player-border">
                  <Label className="text-sm font-medium">Time Range (Optional)</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <div className="flex gap-1 items-center">
                        <Input
                          type="number"
                          placeholder="HH"
                          min="0"
                          max="23"
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="MM"
                          min="0"
                          max="59"
                          value={startMinute}
                          onChange={(e) => setStartMinute(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="SS"
                          min="0"
                          max="59"
                          value={startSecond}
                          onChange={(e) => setStartSecond(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <div className="flex gap-1 items-center">
                        <Input
                          type="number"
                          placeholder="HH"
                          min="0"
                          max="23"
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="MM"
                          min="0"
                          max="59"
                          value={endMinute}
                          onChange={(e) => setEndMinute(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="SS"
                          min="0"
                          max="59"
                          value={endSecond}
                          onChange={(e) => setEndSecond(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Leave empty to play the full video. End time must be after start time.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-player-accent hover:bg-player-accent/90 text-player-bg"
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? (isEditing ? 'Saving Campaign...' : 'Creating Campaign...') : (isEditing ? 'Save Campaign' : 'Create Campaign')}
                </Button>
              </form>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Supported YouTube formats:</p>
                <ul className="space-y-1 text-xs">
                  {exampleUrls.youtube.map((example, i) => (
                    <li key={i} className="font-mono bg-muted p-2 rounded cursor-pointer hover:bg-player-controls-hover transition-colors"
                        onClick={() => setUrl(example)}>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="direct" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="direct-url">Direct Video File URL</Label>
                  <Input
                    id="direct-url"
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-input border-player-border"
                  />
                </div>
                
                {/* Time Controls */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-player-border">
                  <Label className="text-sm font-medium">Time Range (Optional)</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <div className="flex gap-1 items-center">
                        <Input
                          type="number"
                          placeholder="HH"
                          min="0"
                          max="23"
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="MM"
                          min="0"
                          max="59"
                          value={startMinute}
                          onChange={(e) => setStartMinute(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="SS"
                          min="0"
                          max="59"
                          value={startSecond}
                          onChange={(e) => setStartSecond(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <div className="flex gap-1 items-center">
                        <Input
                          type="number"
                          placeholder="HH"
                          min="0"
                          max="23"
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="MM"
                          min="0"
                          max="59"
                          value={endMinute}
                          onChange={(e) => setEndMinute(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          placeholder="SS"
                          min="0"
                          max="59"
                          value={endSecond}
                          onChange={(e) => setEndSecond(e.target.value)}
                          className="w-14 text-center bg-input border-player-border text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Leave empty to play the full video. End time must be after start time.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-player-accent hover:bg-player-accent/90 text-player-bg"
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? (isEditing ? 'Saving Campaign...' : 'Creating Campaign...') : (isEditing ? 'Save Campaign' : 'Create Campaign')}
                </Button>
              </form>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Supported formats: MP4, WebM, OGV</p>
                <p className="mb-2">Example URLs:</p>
                <ul className="space-y-1 text-xs">
                  {exampleUrls.direct.map((example, i) => (
                    <li key={i} className="font-mono bg-muted p-2 rounded cursor-pointer hover:bg-player-controls-hover transition-colors"
                        onClick={() => setUrl(example)}>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-foreground">Features:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Smart URL extraction - works with video player pages</li>
              <li>• No progress bar - prevents skipping content</li>
              <li>• Auto-saves your progress every 5 seconds</li>
              <li>• Resume from where you left off</li>
              <li>• Clean, distraction-free interface</li>
              <li>• Keyboard shortcuts (Space: play/pause, F: fullscreen)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};