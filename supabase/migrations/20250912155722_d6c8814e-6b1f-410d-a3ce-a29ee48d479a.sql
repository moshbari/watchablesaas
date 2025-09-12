-- Fix RLS policies for pages table to ensure users can only see their own pages in the page builder
-- but still allow public viewing of published pages on the frontend

-- Drop the existing policy that allows viewing any published pages
DROP POLICY IF EXISTS "Users can view published pages" ON public.pages;

-- Create a more restrictive policy for viewing published pages
-- This will be used for the public frontend viewing of pages, not the page builder
CREATE POLICY "Public can view published pages anonymously" 
ON public.pages 
FOR SELECT 
TO anon
USING (is_published = true);

-- The existing policy "Users can view their own pages" already ensures
-- authenticated users can only see their own pages in the page builder

-- Ensure the policy for authenticated users to view their own pages is properly set
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
CREATE POLICY "Users can view their own pages" 
ON public.pages 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);