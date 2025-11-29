import React, { useEffect, useRef } from 'react';

interface TellaPlayerProps {
  videoId: string;
  onError?: (error: string) => void;
}

export const TellaPlayer: React.FC<TellaPlayerProps> = ({
  videoId,
  onError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleIframeError = () => {
      onError?.('Failed to load Tella.tv video. Please check the URL and try again.');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('error', handleIframeError);
      return () => iframe.removeEventListener('error', handleIframeError);
    }
  }, [onError]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        ref={iframeRef}
        src={`https://www.tella.tv/video/${videoId}/embed`}
        className="w-full h-full"
        allow="autoplay; encrypted-media"
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
      {/* Overlay to block Tella's header at the top */}
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
    </div>
  );
};
