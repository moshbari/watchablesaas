-- Update user roles and add trial system (fixed enum comparison)
-- First, drop existing role constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create new role enum that includes trial roles
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('TRIAL', 'UNLIMITED', 'SUSPENDED', 'admin');

-- Add trial fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update role column to new enum type
ALTER TABLE public.profiles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.user_role USING 
    CASE 
      WHEN role = 'admin' THEN 'admin'::public.user_role
      ELSE 'TRIAL'::public.user_role
    END,
  ALTER COLUMN role SET DEFAULT 'TRIAL'::public.user_role;

-- Make email optional
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Create function to check if trial is active
CREATE OR REPLACE FUNCTION public.is_trial_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.role = 'TRIAL'::public.user_role AND p.trial_ends_at > now() THEN true
      ELSE false
    END
  FROM public.profiles p
  WHERE p.id = user_id;
$$;

-- Create function to get trial info
CREATE OR REPLACE FUNCTION public.get_trial_info(user_id uuid)
RETURNS TABLE(
  role public.user_role,
  trial_started_at timestamp with time zone,
  trial_ends_at timestamp with time zone,
  is_active boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.role,
    p.trial_started_at,
    p.trial_ends_at,
    CASE 
      WHEN p.role = 'TRIAL'::public.user_role AND p.trial_ends_at > now() THEN true
      ELSE false
    END as is_active
  FROM public.profiles p
  WHERE p.id = user_id;
$$;

-- Create function to suspend expired trials
CREATE OR REPLACE FUNCTION public.suspend_expired_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspended_count INTEGER;
BEGIN
  UPDATE public.profiles 
  SET role = 'SUSPENDED'::public.user_role
  WHERE role = 'TRIAL'::public.user_role 
    AND trial_ends_at <= now();
  
  GET DIAGNOSTICS suspended_count = ROW_COUNT;
  
  RETURN suspended_count;
END;
$$;

-- Update handle_new_user function to set trial dates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set trial start and end dates for new users
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    trial_started_at, 
    trial_ends_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    'TRIAL'::public.user_role,
    now(),
    now() + interval '17 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    trial_started_at = COALESCE(profiles.trial_started_at, now()),
    trial_ends_at = COALESCE(profiles.trial_ends_at, now() + interval '17 days'),
    role = COALESCE(profiles.role, 'TRIAL'::public.user_role);
  
  RETURN NEW;
END;
$$;

-- Add campaign limits check function (fixed enum comparison)
CREATE OR REPLACE FUNCTION public.can_create_campaign(user_id uuid, campaign_type text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.role != 'TRIAL'::public.user_role THEN true
      WHEN campaign_type = 'youtube' THEN 
        (SELECT COUNT(*) FROM public.campaigns c WHERE c.user_id = user_id AND c.video_type = 'youtube' AND c.deleted_at IS NULL) < 1
      WHEN campaign_type = 'page' THEN 
        (SELECT COUNT(*) FROM public.pages pg WHERE pg.user_id = user_id) < 1
      ELSE true
    END
  FROM public.profiles p
  WHERE p.id = user_id;
$$;