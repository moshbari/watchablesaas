-- Optional FAQ section on single-video pages (Page Builder)
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS faq_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS faq_title text,
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
