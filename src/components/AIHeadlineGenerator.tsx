import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

interface HeadlineOption {
  headline: string;
  subHeadline: string;
  rating: number;
  reason: string;
}

interface AIHeadlineGeneratorProps {
  onSelect: (headline: string, subHeadline: string) => void;
}

export const AIHeadlineGenerator: React.FC<AIHeadlineGeneratorProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<HeadlineOption[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!context.trim()) {
      toast({
        title: "Context Required",
        description: "Please provide some information about your video or product",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-headline', {
        body: { context: context.trim() }
      });

      if (error) throw error;

      if (data?.options && Array.isArray(data.options)) {
        setOptions(data.options);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate headlines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseOption = (option: HeadlineOption) => {
    onSelect(option.headline, option.subHeadline);
    toast({
      title: "Applied",
      description: "Headline and sub-headline have been updated",
    });
    // Don't close dialog so users can try other options
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-1" />
          Use AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Headline Generator</DialogTitle>
          <DialogDescription>
            Tell me about your video, product, or service, and I'll generate compelling headline options for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Context Input */}
          <div className="space-y-2">
            <Label htmlFor="ai-context">
              What's your video about? (Product, audience, benefits, problems solved, etc.)
            </Label>
            <Textarea
              id="ai-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Example: A course teaching busy professionals how to build profitable online businesses in 30 days without technical skills or prior experience..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !context.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Options...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate 3 Headline Options
              </>
            )}
          </Button>

          {/* Generated Options */}
          {options.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Generated Options</h3>
              {options.map((option, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-muted-foreground">
                            Option {index + 1}
                          </span>
                          {renderStars(option.rating)}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-lg">{option.headline}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.subHeadline}
                          </p>
                        </div>

                        <div className="bg-muted p-2 rounded text-sm">
                          <span className="font-medium">Why this works: </span>
                          {option.reason}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleUseOption(option)}
                        variant="default"
                        size="sm"
                      >
                        Use This
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};