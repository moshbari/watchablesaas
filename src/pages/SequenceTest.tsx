import React, { useState } from 'react';
import { SequentialVideoPlayer, type BetweenVideosMode } from '@/components/video/SequentialVideoPlayer';
import { normaliseSegment } from '@/lib/videoSegments';

// Temporary harness for comparing the two transition styles on real clips.
const segments = [
  { id: 's1', video_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', start_time: 10, end_time: 22, skip_sections: [], video_type: 'youtube' },
  { id: 's2', video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', start_time: 5, end_time: 17, skip_sections: [], video_type: 'youtube' },
  { id: 's3', video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', start_time: 2, end_time: 14, skip_sections: [], video_type: 'youtube' },
].map(normaliseSegment);

const SequenceTest = () => {
  const [mode, setMode] = useState<BetweenVideosMode>('auto');

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-white text-xl">Sequential playback test — 3 clips, 12s each</h1>

        <div className="flex gap-2">
          {(['auto', 'button'] as BetweenVideosMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm ${
                mode === m ? 'bg-white text-neutral-900' : 'bg-neutral-700 text-white'
              }`}
            >
              {m === 'auto' ? 'Seamless (auto)' : 'Continue button'}
            </button>
          ))}
        </div>

        {/* Remounts on mode change so each run starts clean. */}
        <SequentialVideoPlayer
          key={mode}
          segments={segments}
          mode={mode}
          playButtonColor="#ef4444"
          playButtonSize={96}
          continueButtonText="Continue Watching"
          onError={(e) => console.log('[seqtest] error:', e)}
          onSequenceEnd={() => console.log('[seqtest] sequence ended')}
        />

        <p className="text-neutral-400 text-sm">
          Watch the two cuts. Seamless keeps the next clip loading in the background while the
          current one plays; Continue holds on the last frame until you click.
        </p>
      </div>
    </div>
  );
};

export default SequenceTest;
