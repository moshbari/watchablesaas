-- Update default values for lead opt-in button colors
ALTER TABLE public.pages 
ALTER COLUMN lead_optin_button_bg_color SET DEFAULT '#0084ff',
ALTER COLUMN lead_optin_button_text_color SET DEFAULT '#ffffff';