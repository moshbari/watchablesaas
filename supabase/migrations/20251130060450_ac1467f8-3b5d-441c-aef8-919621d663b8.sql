-- Create table for landing page leads (separate from page-specific leads)
CREATE TABLE IF NOT EXISTS public.landing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view landing leads"
  ON public.landing_leads
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert landing leads"
  ON public.landing_leads
  FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_landing_leads_created_at ON public.landing_leads(created_at DESC);