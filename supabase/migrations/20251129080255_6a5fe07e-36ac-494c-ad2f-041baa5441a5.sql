-- Add color columns for headline and sub-headline with black as default
ALTER TABLE public.pages 
ADD COLUMN headline_color text DEFAULT '#000000',
ADD COLUMN sub_headline_color text DEFAULT '#000000';