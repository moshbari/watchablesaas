import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, Mic, MicOff, AlertCircle, Wand2, Clock, CheckCircle } from 'lucide-react';

interface AIPageGeneratorProps {
  onConfigGenerated: (config: any) => void;
}

export const AIPageGenerator: React.FC<AIPageGeneratorProps> = ({ onConfigGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      setIsAiGenerated(false);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Speak your page description now...",
      });
    } catch (error: any) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: error.message || "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];

      const { data, error } = await supabase.functions.invoke('transcribe-page-prompt', {
        body: { audio: base64Audio }
      });

      if (error) {
        throw new Error(error.message || 'Failed to transcribe audio');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text) {
        setPrompt(prev => prev ? `${prev} ${data.text}` : data.text);
        setIsAiGenerated(true);
        toast({
          title: "Transcription Complete",
          description: "Your speech has been converted to text",
        });
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Failed",
        description: error.message || "Failed to transcribe audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const maxChars = 1000;
  const charCount = prompt.length;

  return (
    <Card className="border-2 border-primary/20 bg-white shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Create Your Perfect Page</CardTitle>
            <CardDescription className="text-muted-foreground">
              Describe your vision and watch AI bring it to life
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Example: Create an urgent sales page for my business coaching program. Make it feel professional but action-oriented. Include a video from https://youtube.com/watch?v=abc123, show a CTA button after 10 seconds, and add a countdown timer set for 48 hours. Use a bold color scheme with navy blue and gold accents."
            value={prompt}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setPrompt(e.target.value);
                setIsAiGenerated(false);
              }
            }}
            rows={6}
            maxLength={maxChars}
            className="resize-none border-2 rounded-xl transition-all focus:border-primary"
            disabled={isGenerating || isRecording || isTranscribing}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {charCount}/{maxChars}
          </div>
        </div>

        <Alert className="bg-warning/10 border-warning/30 border-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <span className="font-semibold text-warning">Pro Tip for Maximum Results:</span>
            <br />
            <span className="text-foreground/80">
              Describe the emotion/tone (urgent, professional, luxurious, friendly) and your target audience. AI will create compelling headlines and choose perfect colors automatically. Mention specifics like video URLs, button timing, countdown timers, and lead capture requirements for a complete page.
            </span>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isRecording && !isTranscribing ? (
            <>
              <Button
                onClick={startRecording}
                type="button"
                disabled={isGenerating}
                className="w-full sm:flex-1 h-14 bg-warning hover:bg-warning/90 text-white border-0 shadow-md rounded-xl font-semibold text-base"
              >
                <Mic className="mr-2 h-5 w-5" />
                Voice Input
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:flex-1 h-14 bg-primary hover:bg-primary/90 text-white shadow-md rounded-xl font-semibold text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate with AI
                  </>
                )}
              </Button>
            </>
          ) : isTranscribing ? (
            <Button disabled className="w-full h-14">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Transcribing...
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="w-full h-14 animate-pulse shadow-md rounded-xl"
            >
              <MicOff className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
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