-- Add new columns for design customization
ALTER TABLE public.pages 
ADD COLUMN headline_font_size integer DEFAULT 48,
ADD COLUMN sub_headline_font_size integer DEFAULT 20,
ADD COLUMN button_bg_color text DEFAULT '#000000',
ADD COLUMN button_text_color text DEFAULT '#ffffff';