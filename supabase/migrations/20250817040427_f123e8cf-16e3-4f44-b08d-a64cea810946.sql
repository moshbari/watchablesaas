-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'self-hosted')),
  video_url TEXT,
  youtube_title TEXT,
  html_script TEXT NOT NULL,
  javascript_script TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to cleanup deleted campaigns after 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_deleted_campaigns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.campaigns
  WHERE deleted_at IS NOT NULL 
  AND deleted_at < now() - interval '24 hours';
END;
$$;

-- Create index for better performance
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_deleted_at ON public.campaigns(deleted_at);
CREATE INDEX idx_campaigns_created_at ON public.campaigns(created_at DESC);