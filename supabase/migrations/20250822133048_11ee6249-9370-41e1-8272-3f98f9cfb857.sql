-- Fix security vulnerability in profiles table
-- Remove the overly permissive INSERT policy that allows unrestricted profile creation
DROP POLICY IF EXISTS "System can insert new profiles" ON public.profiles;

-- Create a more secure INSERT policy that only allows users to create their own profile
-- This prevents unauthorized profile creation while still allowing legitimate user signup
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Add additional security: ensure profiles can only be created once per user
-- This prevents duplicate profile creation attacks
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON public.profiles(id);

-- Update the handle_new_user function to be more secure
-- Ensure it only creates profiles with the correct user ID and validates input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only create profile if one doesn't already exist
  -- Use ON CONFLICT to prevent duplicate insertions
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a policy comment for documentation
COMMENT ON POLICY "Users can create their own profile" ON public.profiles IS 
'Allows users to create only their own profile during signup process. Prevents unauthorized profile creation.';