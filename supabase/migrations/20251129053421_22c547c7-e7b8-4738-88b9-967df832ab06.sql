-- Update default values for main button colors to match lead opt-in button
ALTER TABLE public.pages 
ALTER COLUMN button_bg_color SET DEFAULT '#0084ff',
ALTER COLUMN button_text_color SET DEFAULT '#ffffff';