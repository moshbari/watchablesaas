-- Create table for AI prompt configuration
CREATE TABLE IF NOT EXISTS public.ai_prompt_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_type TEXT NOT NULL UNIQUE,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_prompt_config ENABLE ROW LEVEL SECURITY;

-- Allow admins to read and write
CREATE POLICY "Admins can view AI prompts"
ON public.ai_prompt_config
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert AI prompts"
ON public.ai_prompt_config
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update AI prompts"
ON public.ai_prompt_config
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Insert default prompt for headline generation
INSERT INTO public.ai_prompt_config (prompt_type, prompt_text)
VALUES (
  'headline_generation',
  'You are a professional copywriter. Generate a compelling headline and sub-headline for a video sales letter. The headline should grab attention and the sub-headline should provide supporting details. Return ONLY a JSON object with this exact format: {"headline": "your headline here", "subHeadline": "your sub-headline here"}. Do not include any other text or explanation.'
)
ON CONFLICT (prompt_type) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_ai_prompt_config_updated_at
BEFORE UPDATE ON public.ai_prompt_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();