-- Create pages table for the page builder
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  headline TEXT NOT NULL,
  sub_headline TEXT,
  video_url TEXT,
  video_type TEXT NOT NULL DEFAULT 'youtube',
  button_text TEXT,
  button_url TEXT,
  button_delay INTEGER DEFAULT 3,
  button_enabled BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies for pages
CREATE POLICY "Users can view published pages" 
ON public.pages 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Users can view their own pages" 
ON public.pages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pages" 
ON public.pages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" 
ON public.pages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" 
ON public.pages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug lookups
CREATE INDEX idx_pages_slug ON public.pages(slug) WHERE is_published = true;