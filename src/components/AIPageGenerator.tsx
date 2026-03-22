import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, AlertCircle, Wand2, Clock, CheckCircle } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';

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

  const handleTranscription = (text: string) => {
    setPrompt(prev => prev ? `${prev} ${text}` : text);
  };

  const maxChars = 1000;
  const charCount = prompt.length;

  return (
    <Card className="border-2 border-primary/20 bg-white shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">Create Your Perfect Page</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Describe your vision and watch AI bring it to life
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Example: Create an urgent sales page for my business coaching program. Make it feel professional but action-oriented. Include a video from https://youtube.com/watch?v=abc123, show a CTA button after 10 seconds, and add a countdown timer set for 48 hours. Use a bold color scheme with navy blue and gold accents."
            value={prompt}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setPrompt(e.target.value);
              }
            }}
            rows={4}
            maxLength={maxChars}
            className="resize-none border-2 rounded-xl transition-all focus:border-primary text-sm sm:text-base"
            disabled={isGenerating}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {charCount}/{maxChars}
          </div>
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-warning mb-1">Pro Tip for Maximum Results:</p>
              <p className="text-foreground/80 leading-relaxed">
                Describe the emotion/tone (urgent, professional, luxurious, friendly) and your target audience. AI will create compelling headlines and choose perfect colors automatically. Mention specifics like video URLs, button timing, countdown timers, and lead capture requirements for a complete page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <VoiceRecorder 
            onTranscription={handleTranscription} 
            disabled={isGenerating}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.39)',
              borderRadius: '14px',
              padding: '14px 20px',
              fontWeight: 700,
              border: 'none'
            }}
            className="w-full sm:flex-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                AI
              </>
            )}
          </Button>
        </div>

        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Smart Design</h4>
            <p className="text-sm text-muted-foreground">
              AI-powered layouts that convert visitors into customers
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">59 Seconds</h4>
            <p className="text-sm text-muted-foreground">
              From idea to live page in less than a minute
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Proven Templates</h4>
            <p className="text-sm text-muted-foreground">
              Built on $10M+ in sales page data and best practices
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
