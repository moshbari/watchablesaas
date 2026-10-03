-- Standing rule: every page links the company's three 99dfy.com legal pages.
-- APPLIED BY HAND on 3 Oct 2026 via the Supabase Management API (Lovable does
-- not run migration files that arrive through git). Kept here as the record.
-- Only the exact old winarzapps defaults were replaced; all 41 pages had them.
update pages set privacy_policy_url = 'https://99dfy.com/privacy-policy'
  where privacy_policy_url = 'https://winarzapps.com/privacy-policy/';
update pages set terms_conditions_url = 'https://99dfy.com/terms-conditions'
  where terms_conditions_url = 'https://winarzapps.com/terms-of-service/';
update pages set earnings_disclaimer_url = 'https://99dfy.com/earnings-disclaimer'
  where earnings_disclaimer_url = 'https://winarzapps.com/earning-disclaimer';

alter table pages alter column privacy_policy_url set default 'https://99dfy.com/privacy-policy';
alter table pages alter column terms_conditions_url set default 'https://99dfy.com/terms-conditions';
alter table pages alter column earnings_disclaimer_url set default 'https://99dfy.com/earnings-disclaimer';
