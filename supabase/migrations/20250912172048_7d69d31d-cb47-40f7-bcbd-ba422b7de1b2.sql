-- Fix the role enum and campaign limits function
-- First fix the campaign limits check function with proper enum casting
CREATE OR REPLACE FUNCTION public.can_create_campaign(user_id uuid, campaign_type text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.role::text != 'TRIAL' THEN true
      WHEN campaign_type = 'youtube' THEN 
        (SELECT COUNT(*) FROM public.campaigns c WHERE c.user_id = user_id AND c.video_type = 'youtube' AND c.deleted_at IS NULL) < 1
      WHEN campaign_type = 'page' THEN 
        (SELECT COUNT(*) FROM public.pages pg WHERE pg.user_id = user_id) < 1
      ELSE true
    END
  FROM public.profiles p
  WHERE p.id = user_id;
$$;

-- Also fix the is_trial_active function with proper casting
CREATE OR REPLACE FUNCTION public.is_trial_active(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.role::text = 'TRIAL' AND p.trial_ends_at > now() THEN true
      ELSE false
    END
  FROM public.profiles p
  WHERE p.id = user_id;
$$;

-- Fix the get_trial_info function as well
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
      WHEN p.role::text = 'TRIAL' AND p.trial_ends_at > now() THEN true
      ELSE false
    END as is_active
  FROM public.profiles p
  WHERE p.id = user_id;
$$;

-- Fix the suspend_expired_trials function
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
  WHERE role::text = 'TRIAL'
    AND trial_ends_at <= now();
  
  GET DIAGNOSTICS suspended_count = ROW_COUNT;
  
  RETURN suspended_count;
END;
$$;