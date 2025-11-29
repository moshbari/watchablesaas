-- Add consent field to leads table
ALTER TABLE leads ADD COLUMN consent_given boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN leads.consent_given IS 'Whether the lead consented to being contacted';