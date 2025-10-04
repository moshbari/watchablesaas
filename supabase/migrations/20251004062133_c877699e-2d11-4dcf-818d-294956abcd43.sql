-- Add fake progress bar columns to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS fake_progress_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fake_progress_color TEXT DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS fake_progress_thickness INTEGER DEFAULT 4;