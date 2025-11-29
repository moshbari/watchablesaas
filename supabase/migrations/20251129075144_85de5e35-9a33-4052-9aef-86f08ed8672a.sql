-- Add highlight color field to pages table
ALTER TABLE public.pages 
ADD COLUMN text_highlight_color text DEFAULT '#ef4444';