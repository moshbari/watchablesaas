import React from 'react';
import { SequentialVideoPlayer } from '@/components/video/SequentialVideoPlayer';
import { normaliseSegment } from '@/lib/videoSegments';

// Temporary harness for eyeballing sequential playback locally.
const segments = [
  { id: 's1', video_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', start_time: 10, end_time: 18, skip_sections: [], video_type: 'youtube' },
  { id: 's2', video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', start_time: 5, end_time: 13, skip_sections: [], video_type: 'youtube' },
  { id: 's3', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', start_time: 2, end_time: 10, skip_sections: [], video_type: 'youtube' },
].map(normaliseSegment);

const SequenceTest = () => (
  <div className="min-h-screen bg-neutral-900 p-8">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-white text-xl mb-4">Sequential playback test — 3 clips, 8s each</h1>
      <SequentialVideoPlayer
        segments={segments}
        playButtonColor="#ef4444"
        playButtonSize={96}
        onError={(e) => console.log('[seqtest] error:', e)}
        onSequenceEnd={() => console.log('[seqtest] sequence ended')}
      />
    </div>
  </div>
);

export default SequenceTest;
