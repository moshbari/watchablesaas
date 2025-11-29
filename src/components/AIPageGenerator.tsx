import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIPageGeneratorProps {
  onConfigGenerated: (config: any) => void;
}

export const AIPageGenerator: React.FC<AIPageGeneratorProps> = ({ onConfigGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe what you want in your page",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-page-config', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate configuration');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.config) {
        throw new Error('No configuration returned');
      }

      console.log('Generated config:', data.config);

      toast({
        title: "Success!",
        description: "AI has generated your page configuration. Fields have been populated automatically.",
      });

      onConfigGenerated(data.config);
      setPrompt('');

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate page configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Page Generator</CardTitle>
        </div>
        <CardDescription>
          Describe your page in natural language and AI will automatically fill in all the fields for you.
          Only fields you mention will be updated.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Example: Create a page with a red headline 'Transform Your Business Today', blue sub-headline 'Get started in minutes', add a YouTube video from https://youtube.com/watch?v=abc123, make the CTA button green saying 'Start Now' appearing after 10 seconds, enable lead capture with email required..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="resize-none"
          disabled={isGenerating}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Tip: Be specific! Mention colors (red, blue, #FF0000), button delays (5 seconds, 1 minute), 
          lead capture requirements, video URLs, and any other details you want configured.
        </p>
      </CardContent>
    </Card>
  );
};