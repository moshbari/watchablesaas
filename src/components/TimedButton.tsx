import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimedButtonConfig {
  text: string;
  url: string;
  delayHours: number;
  delayMinutes: number;
  delaySeconds: number;
  width: string;
  height: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
}

const defaultConfig: TimedButtonConfig = {
  text: 'Click Here to Secure Your Spot Now',
  url: 'https://99dfy.com',
  delayHours: 0,
  delayMinutes: 0,
  delaySeconds: 3,
  width: '800px',
  height: '80px',
  backgroundColor: '#3b82f6',
  borderColor: '#1d4ed8',
  textColor: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  fontFamily: 'Verdana, sans-serif',
  alignment: 'center'
};

export const TimedButton: React.FC = () => {
  const [config, setConfig] = useState<TimedButtonConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();

  const updateConfig = (key: keyof TimedButtonConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    // Reset preview when config changes
    setPreviewKey(prev => prev + 1);
  };

  const getTotalDelaySeconds = () => {
    return config.delayHours * 3600 + config.delayMinutes * 60 + config.delaySeconds;
  };

  const generateHTMLCSS = () => {
    const totalDelaySeconds = getTotalDelaySeconds();
    return `<!-- HTML & CSS for Timed Button -->
<div class="timed-button-container" style="text-align: ${config.alignment};">
  <div class="timed-button" style="
    display: none;
    animation: fadeIn 0.5s ease-in forwards;
    animation-delay: ${totalDelaySeconds}s;
  ">
    <a href="${config.url}" target="_blank" style="
      display: inline-block;
      width: ${config.width};
      height: ${config.height};
      max-width: 90vw;
      max-height: 20vh;
      background-color: ${config.backgroundColor};
      border: 4px solid ${config.borderColor};
      color: ${config.textColor};
      font-size: ${config.fontSize};
      font-weight: ${config.fontWeight};
      font-family: ${config.fontFamily};
      text-decoration: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    " 
    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
    >${config.text}</a>
  </div>
</div>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    display: block;
  }
}

.timed-button {
  animation-fill-mode: forwards;
}

/* Responsive Design */
@media (max-width: 768px) {
  .timed-button a {
    width: calc(90vw - 40px) !important;
    height: auto !important;
    min-height: 60px !important;
    padding: 12px 16px !important;
    white-space: normal !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 20px !important;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .timed-button a {
    width: min(80vw, ${config.width}) !important;
    font-size: 26px !important;
  }
}
</style>`;
  };

  const generateJavaScript = () => {
    const totalDelaySeconds = getTotalDelaySeconds();
    return `<!-- JavaScript (Place in separate code block or before </body>) -->
<script>
// Center the video player and show the button after delay
document.addEventListener('DOMContentLoaded', function() {
  // Center any video elements
  const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="embed"]');
  videos.forEach(video => {
    if (!video.closest('center')) {
      const center = document.createElement('center');
      video.parentNode.insertBefore(center, video);
      center.appendChild(video);
    }
  });
});

// Show the button after delay
setTimeout(() => {
  const button = document.querySelector('.timed-button');
  if (button) {
    button.style.display = 'block';
  }
}, ${totalDelaySeconds * 1000});
</script>`;
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generateHTMLCSS());
      toast({
        title: "Copied!",
        description: "HTML & CSS code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyJS = async () => {
    try {
      await navigator.clipboard.writeText(generateJavaScript());
      toast({
        title: "Copied!",
        description: "JavaScript code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              Add Timed Button
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button-text">Button Text</Label>
                <Input
                  id="button-text"
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="Click Here to Secure Your Spot Now"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="button-url">Link URL</Label>
                <Input
                  id="button-url"
                  value={config.url}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://99dfy.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delay Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="delay-hours" className="text-xs">Hours</Label>
                    <Input
                      id="delay-hours"
                      type="number"
                      min="0"
                      value={config.delayHours}
                      onChange={(e) => updateConfig('delayHours', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delay-minutes" className="text-xs">Minutes</Label>
                    <Input
                      id="delay-minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={config.delayMinutes}
                      onChange={(e) => updateConfig('delayMinutes', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delay-seconds" className="text-xs">Seconds</Label>
                    <Input
                      id="delay-seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={config.delaySeconds}
                      onChange={(e) => updateConfig('delaySeconds', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total delay: {getTotalDelaySeconds()} seconds
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alignment">Alignment</Label>
                <select
                  id="alignment"
                  value={config.alignment}
                  onChange={(e) => updateConfig('alignment', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={config.width}
                  onChange={(e) => updateConfig('width', e.target.value)}
                  placeholder="800px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={config.height}
                  onChange={(e) => updateConfig('height', e.target.value)}
                  placeholder="80px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
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
                <Label htmlFor="border-color">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="border-color"
                    type="color"
                    value={config.borderColor}
                    onChange={(e) => updateConfig('borderColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.borderColor}
                    onChange={(e) => updateConfig('borderColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
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
                <Label htmlFor="font-size">Font Size</Label>
                <Input
                  id="font-size"
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', e.target.value)}
                  placeholder="32px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-weight">Font Weight</Label>
                <select
                  id="font-weight"
                  value={config.fontWeight}
                  onChange={(e) => updateConfig('fontWeight', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="600">Semi-bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra-bold (800)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <select
                  id="font-family"
                  value={config.fontFamily}
                  onChange={(e) => updateConfig('fontFamily', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="-apple-system, BlinkMacSystemFont, sans-serif">System Default</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div className="border border-border rounded-lg p-4 bg-muted/30 min-h-[100px] flex items-center justify-center">
                <TimedButtonPreview key={previewKey} config={config} />
              </div>
            </div>

            {/* Generated Code */}
            <div className="space-y-4">
              {/* HTML & CSS Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>HTML & CSS Code</Label>
                  <Button onClick={handleCopyHTML} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy HTML & CSS
                  </Button>
                </div>
                <textarea
                  readOnly
                  value={generateHTMLCSS()}
                  className="w-full h-32 p-3 text-sm font-mono bg-muted border border-border rounded-md resize-none"
                />
              </div>

              {/* JavaScript Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>JavaScript Code</Label>
                  <Button onClick={handleCopyJS} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy JavaScript
                  </Button>
                </div>
                <textarea
                  readOnly
                  value={generateJavaScript()}
                  className="w-full h-24 p-3 text-sm font-mono bg-muted border border-border rounded-md resize-none"
                />
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>For Page Builders:</strong> Copy the HTML & CSS first, then add the JavaScript to a separate "Custom Code" or "JavaScript" section. The button is fully responsive and adapts to different screen sizes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Preview Component
const TimedButtonPreview: React.FC<{ config: TimedButtonConfig }> = ({ config }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(false);
    const totalDelaySeconds = config.delayHours * 3600 + config.delayMinutes * 60 + config.delaySeconds;
    const timer = setTimeout(() => {
      setShowButton(true);
    }, totalDelaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [config.delayHours, config.delayMinutes, config.delaySeconds]);

  const totalDelaySeconds = config.delayHours * 3600 + config.delayMinutes * 60 + config.delaySeconds;

  if (!showButton) {
    return (
      <div className="text-muted-foreground text-sm">
        Button will appear in {totalDelaySeconds} seconds...
      </div>
    );
  }

  return (
    <div style={{ textAlign: config.alignment, width: '100%' }}>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'flex',
          width: config.width,
          height: config.height,
          maxWidth: '90vw',
          maxHeight: '20vh',
          backgroundColor: config.backgroundColor,
          border: `4px solid ${config.borderColor}`,
          color: config.textColor,
          fontSize: config.fontSize,
          fontWeight: config.fontWeight,
          fontFamily: config.fontFamily,
          textDecoration: 'none',
          borderRadius: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        className="hover:scale-105 hover:shadow-lg"
      >
        {config.text}
      </a>
    </div>
  );
};