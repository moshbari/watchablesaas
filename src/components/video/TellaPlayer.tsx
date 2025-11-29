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
  );
};
