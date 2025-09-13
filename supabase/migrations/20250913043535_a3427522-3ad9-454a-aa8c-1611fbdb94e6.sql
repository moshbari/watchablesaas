-- Update admin_set_role function to use correct role values
CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _new_role text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_row public.profiles;
BEGIN
  -- Only allow admins to change roles
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized' USING errcode = '42501';
  END IF;

  -- Validate role - updated to use correct role values
  IF _new_role NOT IN ('TRIAL','UNLIMITED','SUSPENDED','admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE public.profiles
  SET role = _new_role::user_role
  WHERE id = _user_id
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN updated_row;
END;
$function$