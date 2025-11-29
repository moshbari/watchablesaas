import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InputWithClipboardProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export const InputWithClipboard: React.FC<InputWithClipboardProps> = ({ 
  value, 
  onValueChange,
  ...inputProps 
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onValueChange(text);
        toast({
          title: "Pasted",
          description: "Text pasted from clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Please allow clipboard access or paste manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        {...inputProps}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex-1"
      />
      <Button 
        type="button" 
        variant="outline" 
        size="icon"
        onClick={handleCopy}
        title="Copy"
      >
        <Copy className="w-4 h-4" />
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="icon"
        onClick={handlePaste}
        title="Paste"
      >
        <Clipboard className="w-4 h-4" />
      </Button>
    </div>
  );
};

interface TextareaWithClipboardProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export const TextareaWithClipboard: React.FC<TextareaWithClipboardProps> = ({ 
  value, 
  onValueChange,
  ...textareaProps 
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onValueChange(text);
        toast({
          title: "Pasted",
          description: "Text pasted from clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Please allow clipboard access or paste manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        {...textareaProps}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handlePaste}
          className="flex items-center gap-2"
        >
          <Clipboard className="w-4 h-4" />
          Paste
        </Button>
      </div>
    </div>
  );
};
