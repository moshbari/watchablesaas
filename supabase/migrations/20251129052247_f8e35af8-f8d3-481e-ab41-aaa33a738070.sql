-- Add lead opt-in button customization columns to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS lead_optin_button_text TEXT DEFAULT 'Join to Watch Video',
ADD COLUMN IF NOT EXISTS lead_optin_button_bg_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS lead_optin_button_text_color TEXT DEFAULT '#ffffff';