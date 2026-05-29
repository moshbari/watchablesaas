ALTER TABLE public.static_pages
  ADD COLUMN IF NOT EXISTS scarcity_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scarcity_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS scarcity_text text NOT NULL DEFAULT 'Limited time offer',
  ADD COLUMN IF NOT EXISTS scarcity_end_at timestamptz,
  ADD COLUMN IF NOT EXISTS scarcity_bg_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS scarcity_text_color text NOT NULL DEFAULT '#ffeb3b';