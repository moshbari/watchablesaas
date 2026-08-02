import React from 'react';
import { VideoContainer } from './VideoContainer';
import { SequentialVideoPlayer, type BetweenVideosMode } from './SequentialVideoPlayer';
import { type OverlayButtonConfig } from '../VideoOverlayButton';
import { type VideoSegment } from '@/lib/videoSegments';

interface PageVideoProps {
  segments: VideoSegment[];
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
  overlayButtonConfig?: OverlayButtonConfig;
  fakeProgressEnabled?: boolean;
  fakeProgressColor?: string;
  fakeProgressThickness?: number;
  mobileFullscreenEnabled?: boolean;
  disableResume?: boolean;
  /** Only meaningful with more than one video. */
  mode?: BetweenVideosMode;
  continueButtonText?: string;
  continueButtonBgColor?: string;
  continueButtonTextColor?: string;
}

/**
 * Renders a page's video area.
 *
 * A single segment keeps using the original player untouched — including resume,
 * Google Drive and Tella support. Two or more segments switch to the sequential
 * player, which chains them back-to-back.
 */
export const PageVideo: React.FC<PageVideoProps> = ({
  segments,
  mode,
  continueButtonText,
  continueButtonBgColor,
  continueButtonTextColor,
  ...props
}) => {
  if (segments.length === 0) return null;

  if (segments.length === 1) {
    const [only] = segments;
    return (
      <VideoContainer
        src={only.video_url}
        startTime={only.start_time}
        endTime={only.end_time}
        skipSections={only.skip_sections}
        {...props}
      />
    );
  }

  return (
    <SequentialVideoPlayer
      segments={segments}
      mode={mode}
      continueButtonText={continueButtonText}
      continueButtonBgColor={continueButtonBgColor}
      continueButtonTextColor={continueButtonTextColor}
      {...props}
    />
  );
};
