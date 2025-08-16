import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExternalScriptConfig {
  text: string;
  url: string;
  delayHours: number;
  delayMinutes: number;
  delaySeconds: number;
  position: string;
  width: string;
  height: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
}

const defaultConfig: ExternalScriptConfig = {
  text: 'Click Here to Secure Your Spot Now',
  url: 'https://99dfy.com',
  delayHours: 0,
  delayMinutes: 0,
  delaySeconds: 3,
  position: 'center',
  width: '800px',
  height: '80px',
  backgroundColor: '#3b82f6',
  borderColor: '#1d4ed8',
  textColor: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  fontFamily: 'Verdana, sans-serif'
};

export const ExternalVideoScript: React.FC = () => {
  const [config, setConfig] = useState<ExternalScriptConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const updateConfig = (key: keyof ExternalScriptConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getTotalDelaySeconds = () => {
    return config.delayHours * 3600 + config.delayMinutes * 60 + config.delaySeconds;
  };

  const generateHTMLCode = () => {
    return `<!-- No HTML required - JavaScript creates the overlay button automatically -->`;
  };

  const generateJavaScriptCode = () => {
    const totalDelaySeconds = getTotalDelaySeconds();
    
    return `(function() {
  var config = {
    text: '${config.text.replace(/'/g, "\\'")}',
    url: '${config.url}',
    delay: ${totalDelaySeconds},
    position: '${config.position}',
    width: '${config.width}',
    height: '${config.height}',
    backgroundColor: '${config.backgroundColor}',
    borderColor: '${config.borderColor}',
    textColor: '${config.textColor}',
    fontSize: '${config.fontSize}',
    fontWeight: '${config.fontWeight}',
    fontFamily: '${config.fontFamily}'
  };

  var positionStyles = {
    'top-left': 'top: 20px; left: 20px;',
    'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
    'top-right': 'top: 20px; right: 20px;',
    'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
    'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
    'bottom-right': 'bottom: 20px; right: 20px;'
  };

  function createButton() {
    var targetElement = document.body;
    var existingButton = document.getElementById('overlay-button-generated');
    if (existingButton) return;

    var button = document.createElement('a');
    button.id = 'overlay-button-generated';
    button.href = config.url;
    button.target = '_blank';
    button.textContent = config.text;
    
    var styles = 'position: fixed; ' + 
                 (positionStyles[config.position] || positionStyles['center']) + 
                 ' width: ' + config.width + '; height: ' + config.height + ';' +
                 ' max-width: 90vw; max-height: 20vh;' +
                 ' background-color: ' + config.backgroundColor + ';' +
                 ' border: 4px solid ' + config.borderColor + ';' +
                 ' color: ' + config.textColor + ';' +
                 ' font-size: ' + config.fontSize + ';' +
                 ' font-weight: ' + config.fontWeight + ';' +
                 ' font-family: ' + config.fontFamily + ';' +
                 ' text-decoration: none; border-radius: 8px;' +
                 ' display: none; align-items: center; justify-content: center;' +
                 ' text-align: center; z-index: 9999; cursor: pointer;' +
                 ' box-shadow: 0 4px 12px rgba(0,0,0,0.25);' +
                 ' transition: all 0.3s ease; outline: none;' +
                 ' white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    
    button.style.cssText = styles;

    button.onmouseenter = function() {
      this.style.transform = this.style.transform.replace('scale(1.05)', '') + ' scale(1.05)';
    };

    button.onmouseleave = function() {
      this.style.transform = this.style.transform.replace(' scale(1.05)', '');
    };

    setTimeout(function() {
      button.style.display = 'flex';
    }, config.delay * 1000);

    targetElement.appendChild(button);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }

})();`;
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(generateHTMLCode());
      toast({
        title: "HTML Copied!",
        description: "HTML code copied to clipboard",
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
      await navigator.clipboard.writeText(generateJavaScriptCode());
      toast({
        title: "JavaScript Copied!",
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
              🌐 Add Overlay Button to YOUR Website
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Copy these codes to add overlay buttons to videos on your own website
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Universal Script:</strong> This script can be injected into any website to add overlay buttons to existing video players. Perfect for sites like MeetVio, YouTube, Vimeo, etc.
              </p>
            </div>

            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ext-button-text">Button Text</Label>
                <Input
                  id="ext-button-text"
                  value={config.text}
                  onChange={(e) => updateConfig('text', e.target.value)}
                  placeholder="Click Here to Secure Your Spot Now"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-button-url">Link URL</Label>
                <Input
                  id="ext-button-url"
                  value={config.url}
                  onChange={(e) => updateConfig('url', e.target.value)}
                  placeholder="https://99dfy.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Delay Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="ext-delay-hours" className="text-xs">Hours</Label>
                    <Input
                      id="ext-delay-hours"
                      type="number"
                      min="0"
                      value={config.delayHours}
                      onChange={(e) => updateConfig('delayHours', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ext-delay-minutes" className="text-xs">Minutes</Label>
                    <Input
                      id="ext-delay-minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={config.delayMinutes}
                      onChange={(e) => updateConfig('delayMinutes', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ext-delay-seconds" className="text-xs">Seconds</Label>
                    <Input
                      id="ext-delay-seconds"
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
                <Label htmlFor="ext-position">Position</Label>
                <select
                  id="ext-position"
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
                <Label htmlFor="ext-width">Width</Label>
                <Input
                  id="ext-width"
                  value={config.width}
                  onChange={(e) => updateConfig('width', e.target.value)}
                  placeholder="200px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-height">Height</Label>
                <Input
                  id="ext-height"
                  value={config.height}
                  onChange={(e) => updateConfig('height', e.target.value)}
                  placeholder="50px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="ext-bg-color"
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
                <Label htmlFor="ext-border-color">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="ext-border-color"
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
                <Label htmlFor="ext-text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="ext-text-color"
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
                <Label htmlFor="ext-font-size">Font Size</Label>
                <Input
                  id="ext-font-size"
                  value={config.fontSize}
                  onChange={(e) => updateConfig('fontSize', e.target.value)}
                  placeholder="32px"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ext-font-weight">Font Weight</Label>
                <select
                  id="ext-font-weight"
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
                <Label htmlFor="ext-font-family">Font Family</Label>
                <select
                  id="ext-font-family"
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

            {/* HTML Code Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>✅ No HTML Required!</Label>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Good news!</strong> You only need to add the JavaScript code below. No HTML required!
                </p>
              </div>
            </div>

            {/* JavaScript Code Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>📋 JavaScript Code (Add to Script Section)</Label>
                <Button onClick={handleCopyJS} size="sm" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JavaScript
                </Button>
              </div>
              <textarea
                readOnly
                value={generateJavaScriptCode()}
                className="w-full h-48 p-3 text-sm font-mono bg-muted border border-border rounded-md resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Add this JavaScript code to your Custom Code, Script, or before closing {"</body>"} tag
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>📝 Simple Setup:</strong> Just add this JavaScript code to your website's Custom Code section, Script area, or before the closing {"</body>"} tag.
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                <strong>✅ Works with:</strong> WordPress, Wix, Squarespace, Webflow, and any website with video content.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};