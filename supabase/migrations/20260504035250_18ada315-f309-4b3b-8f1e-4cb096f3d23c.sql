CREATE TABLE public.multivideo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  headline TEXT NOT NULL,
  sub_headline TEXT,
  headline_font_size INTEGER DEFAULT 30,
  headline_color TEXT DEFAULT '#0064c2',
  sub_headline_font_size INTEGER DEFAULT 18,
  sub_headline_color TEXT DEFAULT '#4a4a4a',
  text_highlight TEXT,
  text_highlight_color TEXT DEFAULT '#e73508',
  text_bold TEXT,
  text_italic TEXT,
  text_underline TEXT,
  button_enabled BOOLEAN DEFAULT false,
  button_text TEXT,
  button_url TEXT,
  button_bg_color TEXT DEFAULT '#007bc7',
  button_text_color TEXT DEFAULT '#ffffff',
  button_delay INTEGER DEFAULT 3,
  columns INTEGER NOT NULL DEFAULT 1,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.multivideo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own multivideo pages"
ON public.multivideo_pages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view published multivideo pages"
ON public.multivideo_pages FOR SELECT TO anon
USING (is_published = true);

CREATE POLICY "Users can create their own multivideo pages"
ON public.multivideo_pages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own multivideo pages"
ON public.multivideo_pages FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own multivideo pages"
ON public.multivideo_pages FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_multivideo_pages_updated_at
BEFORE UPDATE ON public.multivideo_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_multivideo_pages_user_id ON public.multivideo_pages(user_id);
CREATE INDEX idx_multivideo_pages_slug ON public.multivideo_pages(slug);