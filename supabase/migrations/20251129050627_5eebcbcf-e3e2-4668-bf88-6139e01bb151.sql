-- Add lead_optin_mandatory column to pages table
ALTER TABLE public.pages 
ADD COLUMN lead_optin_mandatory boolean DEFAULT false;