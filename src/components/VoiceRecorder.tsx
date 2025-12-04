import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Clean up previous audio
  const cleanupAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
    setAudioBlob(null);
    setAudioDuration(0);
    setIsPlaying(false);
  }, []);

  const startRecording = async () => {
    try {
      // Clean up any existing recording first
      cleanupAudio();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
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

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Get duration - use different approach for Safari/iOS
        const audio = new Audio();
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        
        // Handle duration calculation
        const handleDuration = () => {
          if (audio.duration && isFinite(audio.duration)) {
            setAudioDuration(Math.round(audio.duration));
          } else {
            // Estimate based on blob size (~16kbps for webm audio)
            const estimatedDuration = Math.round(blob.size / 2000);
            setAudioDuration(estimatedDuration > 0 ? estimatedDuration : 1);
          }
          URL.revokeObjectURL(blobUrl);
        };
        
        audio.onloadedmetadata = handleDuration;
        audio.onerror = () => {
          // Fallback for browsers that can't read duration
          setAudioDuration(Math.round(blob.size / 2000) || 1);
          URL.revokeObjectURL(blobUrl);
        };
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
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
      
      toast({
        title: "Recording Stopped",
        description: "You can now play, delete, or transcribe your recording.",
      });
    }
  };

  const playAudio = () => {
    if (!audioBlob) return;
    
    if (isPlaying && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio();
    audio.src = URL.createObjectURL(audioBlob);
    audioElementRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.play();
    setIsPlaying(true);
  };

  const deleteRecording = () => {
    cleanupAudio();
    toast({
      title: "Recording Deleted",
      description: "Your recording has been removed.",
    });
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    
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
        onTranscription(data.text);
        // Clean up after successful transcription
        cleanupAudio();
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Recording state - show stop button
  if (isRecording) {
    return (
      <Button
        onClick={stopRecording}
        type="button"
        variant="destructive"
        style={{ padding: '14px 20px', borderRadius: '14px', fontWeight: 700 }}
        className="w-full sm:flex-1 animate-pulse transition-all duration-200"
      >
        <Square className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Stop Recording
      </Button>
    );
  }

  // Transcribing state
  if (isTranscribing) {
    return (
      <Button 
        disabled 
        className="w-full sm:flex-1" 
        style={{ padding: '14px 20px', borderRadius: '14px', fontWeight: 700 }}
      >
        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        Transcribing...
      </Button>
    );
  }

  // Has recording - show play, delete, transcribe buttons
  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 w-full sm:flex-1">
        <Button
          onClick={playAudio}
          type="button"
          variant="outline"
          size="sm"
          className="h-10 px-3 sm:px-4"
          style={{ borderRadius: '10px', fontWeight: 600 }}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 sm:mr-1.5" />
          ) : (
            <Play className="h-4 w-4 sm:mr-1.5" />
          )}
          <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          <span className="text-xs ml-1">({formatDuration(audioDuration)})</span>
        </Button>
        <Button
          onClick={deleteRecording}
          type="button"
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0"
          style={{ borderRadius: '10px' }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <Button
          onClick={transcribeAudio}
          type="button"
          disabled={disabled}
          size="sm"
          style={{ 
            backgroundColor: '#22c55e',
            color: '#ffffff',
            boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)',
            borderRadius: '10px',
            fontWeight: 700,
            border: 'none'
          }}
          className="h-10 px-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
        >
          Transcribe
        </Button>
      </div>
    );
  }

  // Default state - show record button
  return (
    <Button
      onClick={startRecording}
      type="button"
      disabled={disabled}
      style={{ 
        backgroundColor: '#fbbf24',
        color: '#78350f',
        boxShadow: '0 4px 14px 0 rgba(251, 191, 36, 0.39)',
        borderRadius: '14px',
        padding: '14px 20px',
        fontWeight: 700,
        border: 'none'
      }}
      className="w-full sm:flex-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base"
    >
      <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
      Voice Input
    </Button>
  );
};
