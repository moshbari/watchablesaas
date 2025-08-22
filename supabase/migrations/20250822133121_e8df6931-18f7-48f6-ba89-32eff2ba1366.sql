-- Fix the search_path issue in all database functions for security
-- This prevents potential security vulnerabilities from search path manipulation

-- Update handle_new_user function with proper search_path
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

-- Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update is_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id AND p.role = 'admin'
  );
$$;

-- Update admin_set_role function with proper search_path
CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _new_role text)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  updated_row public.profiles;
BEGIN
  -- Only allow admins to change roles
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized' USING errcode = '42501';
  END IF;

  -- Validate role
  IF _new_role NOT IN ('admin','user','interested') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles
  SET role = _new_role
  WHERE id = _user_id
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN updated_row;
END;
$$;

-- Update is_sp_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_sp_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sp_user_roles r 
    WHERE r.user_id = _user_id AND r.role = 'admin'
  );
$$;

-- Update sp_handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.sp_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.sp_user_roles(user_id, role)
  VALUES (NEW.id, 'interested')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;