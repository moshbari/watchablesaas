-- Create leads table to store visitor information
CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, -- page owner's user_id for easy filtering
  name text,
  email text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Users can view their own leads (leads from their pages)
CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can insert leads (for public pages)
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Add lead optin configuration fields to pages table
ALTER TABLE public.pages
ADD COLUMN lead_optin_enabled boolean DEFAULT false,
ADD COLUMN lead_optin_name_enabled boolean DEFAULT true,
ADD COLUMN lead_optin_name_required boolean DEFAULT false,
ADD COLUMN lead_optin_email_enabled boolean DEFAULT true,
ADD COLUMN lead_optin_email_required boolean DEFAULT true,
ADD COLUMN lead_optin_phone_enabled boolean DEFAULT false,
ADD COLUMN lead_optin_phone_required boolean DEFAULT false,
ADD COLUMN lead_optin_button_text text DEFAULT 'Join to Watch Video',
ADD COLUMN lead_optin_headline text DEFAULT 'Become a Member',
ADD COLUMN lead_optin_description text DEFAULT 'Enter your information to watch this exclusive video';