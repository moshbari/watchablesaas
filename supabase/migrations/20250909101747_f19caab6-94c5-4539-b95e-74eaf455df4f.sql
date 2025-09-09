-- Add legal disclaimer and footer fields to pages table
ALTER TABLE public.pages 
ADD COLUMN footer_enabled boolean DEFAULT true,
ADD COLUMN copyright_text text DEFAULT '2025 Mosh Bari - Copyright© 2025. All Rights Reserved.',
ADD COLUMN privacy_policy_url text DEFAULT 'https://winarzapps.com/privacy-policy/',
ADD COLUMN terms_conditions_url text DEFAULT 'https://winarzapps.com/terms-of-service/', 
ADD COLUMN earnings_disclaimer_url text DEFAULT 'https://winarzapps.com/earning-disclaimer',
ADD COLUMN legal_disclaimer_text text DEFAULT 'This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.',
ADD COLUMN earnings_disclaimer_text text DEFAULT '*Earnings and income representations made by Mosh Bari, Mosh Bari''s agency, and Mosh Bari''s agency and their advertisers/sponsors (collectively, "Mosh Bari''s agency") are aspirational statements only of your earnings potential. These results are not typical and results will vary. The results on this page are OUR results and from years of testing. We can in NO way guarantee you will get similar results.';