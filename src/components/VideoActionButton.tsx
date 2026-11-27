import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { OverlayButtonConfig } from '@/components/VideoOverlayButton';

interface VideoActionButtonProps {
  config: OverlayButtonConfig;
}

export const VideoActionButton: React.FC<VideoActionButtonProps> = ({ config }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!config.enabled) return;
    
    setShowButton(false);
    const timer = setTimeout(() => {
      setShowButton(true);
    }, config.delay * 1000);

    return () => clearTimeout(timer);
  }, [config.enabled, config.delay]);

  if (!config.enabled || !showButton) {
    return null;
  }

  return (
    <div className="flex justify-center mt-6 animate-fade-in px-4">
      <Button
        asChild
        className="hover:scale-105 transition-all duration-200 h-auto min-h-[60px] whitespace-normal w-full max-w-md sm:max-w-lg lg:max-w-xl"
        style={{
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          fontWeight: '600',
        }}
      >
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-6 py-4 text-center leading-tight whitespace-normal"
          style={{
            fontSize: `clamp(14px, ${config.fontSize}, 20px)`,
          }}
        >
          <span className="min-w-0 flex-shrink whitespace-normal break-words [overflow-wrap:anywhere]">{config.text}</span>
          <span className="flex-shrink-0" style={{ fontSize: '0.8em' }}>→</span>
        </a>
      </Button>
    </div>
  );
};