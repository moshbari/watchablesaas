import React, { useEffect, useRef } from 'react';

interface GoogleDrivePlayerProps {
  fileId: string;
  onError?: (error: string) => void;
}

export const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  fileId,
  onError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    <iframe
      ref={iframeRef}
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
  );
};
