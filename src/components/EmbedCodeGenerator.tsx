import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface EmbedCodeGeneratorProps {
  videoUrl: string;
  playButtonColor?: string;
  playButtonSize?: number;
  startTime?: number;
  endTime?: number;
}

export const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ 
  videoUrl, 
  playButtonColor = '#ff0000', 
  playButtonSize = 96,
  startTime,
  endTime
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Use production domain for embed codes
  const productionDomain = 'https://watchable.99dfy.com';
  
  // Generate the embed code with play button customization
  const embedParams = new URLSearchParams({
    video: videoUrl,
    playButtonColor: playButtonColor,
    playButtonSize: playButtonSize.toString()
  });
  
  if (startTime !== undefined) {
    embedParams.set('startTime', startTime.toString());
  }
  if (endTime !== undefined) {
    embedParams.set('endTime', endTime.toString());
  }
  
  const embedCode = `<center><iframe src="${productionDomain}/embed-player.html?${embedParams.toString()}" width="800" height="450" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" style="max-width: 100%; height: auto; aspect-ratio: 16/9;"></iframe></center>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: "Embed code copied!",
        description: "The HTML code has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please select and copy the code manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4 text-foreground">
        Embed This Video
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Copy and paste this HTML code into your website or page builder:
      </p>
      
      <div className="relative">
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto text-foreground font-mono">
          <code>{embedCode}</code>
        </pre>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>This embed code will create a responsive video player that works in any HTML editor or page builder like GoHighLevel.</p>
      </div>
    </Card>
  );
};