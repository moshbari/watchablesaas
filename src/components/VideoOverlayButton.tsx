import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface OverlayButtonConfig {
  enabled: boolean;
  text: string;
  url: string;
  delay: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  width: string;
  height: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
}

interface VideoOverlayButtonProps {
  config: OverlayButtonConfig;
  onConfigChange: (config: OverlayButtonConfig) => void;
}

const defaultConfig: OverlayButtonConfig = {
  enabled: false,
  text: 'Click Here to Secure Your Spot Now',
  url: 'https://example.com',
  delay: 3,
  position: 'top-right',
  width: '320px',
  height: '60px',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  fontSize: '16px'
};

export const VideoOverlayButton: React.FC<VideoOverlayButtonProps> = ({ 
  config, 
  onConfigChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateConfig = (key: keyof OverlayButtonConfig, value: string | number | boolean) => {
    const newConfig = { ...config, [key]: value };
    onConfigChange(newConfig);
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              Overlay Button (for this video player)
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Enable/Disable Switch */}
            <div className="flex items-center space-x-2">
              <Switch
                id="overlay-enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => updateConfig('enabled', checked)}
              />
              <Label htmlFor="overlay-enabled">Enable overlay button</Label>
            </div>

            {config.enabled && (
              <>
                {/* Configuration Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overlay-text">Button Text</Label>
                    <Input
                      id="overlay-text"
                      value={config.text}
                      onChange={(e) => updateConfig('text', e.target.value)}
                      placeholder="Click Here to Secure Your Spot Now"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-url">Link URL</Label>
                    <Input
                      id="overlay-url"
                      value={config.url}
                      onChange={(e) => updateConfig('url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-delay">Delay (seconds)</Label>
                    <Input
                      id="overlay-delay"
                      type="number"
                      min="0"
                      value={config.delay}
                      onChange={(e) => updateConfig('delay', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-position">Position</Label>
                    <select
                      id="overlay-position"
                      value={config.position}
                      onChange={(e) => updateConfig('position', e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="top-left">Top Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>
                      <option value="center-left">Center Left</option>
                      <option value="center">Center</option>
                      <option value="center-right">Center Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-width">Width</Label>
                    <Input
                      id="overlay-width"
                      value={config.width}
                      onChange={(e) => updateConfig('width', e.target.value)}
                      placeholder="320px"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-height">Height</Label>
                    <Input
                      id="overlay-height"
                      value={config.height}
                      onChange={(e) => updateConfig('height', e.target.value)}
                      placeholder="60px"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="overlay-bg-color"
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={config.backgroundColor}
                        onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overlay-text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="overlay-text-color"
                        type="color"
                        value={config.textColor}
                        onChange={(e) => updateConfig('textColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={config.textColor}
                        onChange={(e) => updateConfig('textColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overlay-font-size">Font Size</Label>
                    <Input
                      id="overlay-font-size"
                      value={config.fontSize}
                      onChange={(e) => updateConfig('fontSize', e.target.value)}
                      placeholder="16px"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Utility function to get position classes
export const getPositionClasses = (position: OverlayButtonConfig['position']) => {
  const baseClasses = "absolute z-10";
  
  switch (position) {
    case 'top-left':
      return `${baseClasses} top-4 left-4`;
    case 'top-center':
      return `${baseClasses} top-4 left-1/2 -translate-x-1/2`;
    case 'top-right':
      return `${baseClasses} top-4 right-4`;
    case 'center-left':
      return `${baseClasses} top-1/2 left-4 -translate-y-1/2`;
    case 'center':
      return `${baseClasses} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`;
    case 'center-right':
      return `${baseClasses} top-1/2 right-4 -translate-y-1/2`;
    case 'bottom-left':
      return `${baseClasses} bottom-4 left-4`;
    case 'bottom-center':
      return `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`;
    case 'bottom-right':
      return `${baseClasses} bottom-4 right-4`;
    default:
      return `${baseClasses} top-4 right-4`;
  }
};

// Component to render the actual overlay button
export const OverlayButton: React.FC<{ 
  config: OverlayButtonConfig; 
  onVideoContainer?: boolean;
}> = ({ config, onVideoContainer = false }) => {
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

  const buttonStyle = {
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    fontSize: config.fontSize,
    textDecoration: 'none',
    borderRadius: '8px',
    lineHeight: config.height,
    textAlign: 'center' as const,
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer'
  };

  const containerClasses = onVideoContainer 
    ? getPositionClasses(config.position)
    : "flex justify-center";

  return (
    <div className={`${containerClasses} animate-fade-in`}>
      <a
        href={config.url}
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyle}
        className="hover:scale-105 hover:shadow-lg transition-all duration-200"
      >
        {config.text}
      </a>
    </div>
  );
};