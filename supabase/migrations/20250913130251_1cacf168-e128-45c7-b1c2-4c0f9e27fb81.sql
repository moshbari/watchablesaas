-- Update the can_create_campaign function to ensure trial users can create 1 campaign of each type
CREATE OR REPLACE FUNCTION public.can_create_campaign(_user_id uuid, _campaign_type text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN p.role != 'TRIAL' THEN true
      WHEN _campaign_type = 'youtube' THEN 
        (SELECT COUNT(*) FROM public.campaigns c WHERE c.user_id = _user_id AND c.video_type = 'youtube' AND c.deleted_at IS NULL) < 1
      WHEN _campaign_type = 'page' THEN 
        (SELECT COUNT(*) FROM public.pages pg WHERE pg.user_id = _user_id) < 1
      ELSE true
    END
  FROM public.profiles p
  WHERE p.id = _user_id;
$$;