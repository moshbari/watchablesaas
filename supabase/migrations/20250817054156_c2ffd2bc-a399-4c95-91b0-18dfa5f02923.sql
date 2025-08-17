-- Add DELETE policy for campaigns table to allow users to delete their own campaigns
CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);