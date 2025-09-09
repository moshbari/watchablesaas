import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { OverlayButtonConfig } from '@/components/VideoOverlayButton';
import { ArrowRight } from 'lucide-react';

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
    <div className="flex justify-center mt-6 animate-fade-in">
      <Button
        asChild
        className="hover:scale-105 transition-all duration-200"
        style={{
          width: config.width,
          height: config.height,
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          fontSize: config.fontSize,
          fontWeight: '600',
        }}
      >
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2"
        >
          <span>{config.text}</span>
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </a>
      </Button>
    </div>
  );
};