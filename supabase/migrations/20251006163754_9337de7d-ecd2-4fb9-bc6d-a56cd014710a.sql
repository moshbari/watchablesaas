-- Add mobile fullscreen option to pages table
ALTER TABLE public.pages 
ADD COLUMN mobile_fullscreen_enabled BOOLEAN DEFAULT true;