-- Add start_time and end_time columns to pages table
ALTER TABLE public.pages 
ADD COLUMN start_time integer,
ADD COLUMN end_time integer;