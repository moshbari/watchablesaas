import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, Mic, MicOff } from 'lucide-react';

interface AIPageGeneratorProps {
  onConfigGenerated: (config: any) => void;
}

export const AIPageGenerator: React.FC<AIPageGeneratorProps> = ({ onConfigGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
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
          disabled={isGenerating || isRecording || isTranscribing}
        />
        <div className="flex gap-2">
          {!isRecording && !isTranscribing ? (
            <>
              <Button
                onClick={startRecording}
                variant="outline"
                type="button"
                disabled={isGenerating}
              >
                <Mic className="mr-2 h-4 w-4" />
                Voice Input
              </Button>
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
            </>
          ) : isTranscribing ? (
            <Button disabled className="flex-1" size="lg">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transcribing...
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex-1 animate-pulse"
              size="lg"
            >
              <MicOff className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Tip: Be specific! Mention colors (red, blue, #FF0000), button delays (5 seconds, 1 minute), 
          lead capture requirements, video URLs, and any other details you want configured.
        </p>
      </CardContent>
    </Card>
  );
};