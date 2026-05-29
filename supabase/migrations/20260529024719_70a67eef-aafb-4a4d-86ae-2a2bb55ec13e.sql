ALTER TABLE public.static_pages
  ADD COLUMN IF NOT EXISTS cta_bar_bg_color TEXT DEFAULT '#0a0a0a',
  ADD COLUMN IF NOT EXISTS auto_complementary BOOLEAN DEFAULT true;