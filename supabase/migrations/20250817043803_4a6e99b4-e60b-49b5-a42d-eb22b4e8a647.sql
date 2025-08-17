-- Add start_time and end_time columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN start_time integer,
ADD COLUMN end_time integer;