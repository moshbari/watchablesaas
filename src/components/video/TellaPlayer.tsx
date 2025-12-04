import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface TellaPlayerProps {
  videoId: string;
  onError?: (error: string) => void;
  playButtonColor?: string;
  playButtonSize?: number;
}

export const TellaPlayer: React.FC<TellaPlayerProps> = ({
  videoId,
  onError,
  playButtonColor = '#ff0000',
  playButtonSize = 96
}) => {
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayClick = () => {
    setHasStarted(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        src={`https://www.tella.tv/video/${videoId}/embed?b=0&title=0&a=0&loop=0&t=0&muted=0&wt=0`}
        className="w-full h-full"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Custom Play Button Overlay - shown until user starts video */}
      {!hasStarted && (
        <div
          onClick={handlePlayClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            zIndex: 20,
            transition: 'background-color 0.2s ease'
          }}
          className="hover:bg-black/20"
        >
          <div 
            className="flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
            style={{ 
              width: playButtonSize, 
              height: playButtonSize, 
              backgroundColor: playButtonColor
            }}
          >
            <Play 
              className="text-white fill-white" 
              style={{ 
                width: playButtonSize * 0.45, 
                height: playButtonSize * 0.45,
                marginLeft: playButtonSize * 0.08
              }} 
            />
          </div>
        </div>
      )}
      
      {/* Overlay to block Tella's header - only when video is playing */}
      {hasStarted && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '80px',
              zIndex: 10,
              pointerEvents: 'auto',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Overlay to block Tella's progress bar and controls at the bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              zIndex: 10,
              pointerEvents: 'auto',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}
    </div>
  );
};
