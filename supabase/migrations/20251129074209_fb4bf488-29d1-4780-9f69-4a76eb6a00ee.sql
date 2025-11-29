-- Add text formatting fields to pages table
ALTER TABLE pages 
ADD COLUMN text_highlight TEXT,
ADD COLUMN text_bold TEXT,
ADD COLUMN text_italic TEXT,
ADD COLUMN text_underline TEXT;