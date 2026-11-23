import React, { useEffect, useRef, useState } from 'react';

interface GoogleDrivePlayerProps {
  fileId: string;
  onError?: (error: string) => void;
  /** the video's picture, shown while Drive's player loads */
  posterUrl?: string;
}

export const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  fileId,
  onError,
  posterUrl
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [posterOk, setPosterOk] = useState(true);

  useEffect(() => {
    const handleIframeError = () => {
      onError?.('Failed to load Google Drive video. Please make sure the video is publicly accessible.');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('error', handleIframeError);
      return () => iframe.removeEventListener('error', handleIframeError);
    }
  }, [onError]);

  return (
    <>
    <iframe
      ref={iframeRef}
      onLoad={() => setTimeout(() => setFrameLoaded(true), 600)}
      src={`https://drive.google.com/file/d/${fileId}/preview`}
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
    {posterUrl && posterOk && !frameLoaded && (
      <img
        src={posterUrl}
        alt=""
        onError={() => setPosterOk(false)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000', pointerEvents: 'none' }}
      />
    )}
    </>
  );
};
