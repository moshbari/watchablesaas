
CREATE TABLE public.static_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Static Page',
  html_content TEXT NOT NULL DEFAULT '',
  cta_enabled BOOLEAN NOT NULL DEFAULT true,
  cta_text TEXT NOT NULL DEFAULT 'Click Here To Get Started',
  cta_url TEXT NOT NULL DEFAULT 'https://example.com',
  cta_bg_color TEXT NOT NULL DEFAULT '#007bc7',
  cta_text_color TEXT NOT NULL DEFAULT '#ffffff',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.static_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.static_pages TO authenticated;
GRANT ALL ON public.static_pages TO service_role;

ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published static pages"
  ON public.static_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view their own static pages"
  ON public.static_pages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own static pages"
  ON public.static_pages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own static pages"
  ON public.static_pages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own static pages"
  ON public.static_pages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_static_pages_updated_at
  BEFORE UPDATE ON public.static_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
