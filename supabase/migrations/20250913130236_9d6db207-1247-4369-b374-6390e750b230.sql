-- Update the can_create_campaign function to ensure trial users can create 1 campaign of each type
CREATE OR REPLACE FUNCTION public.can_create_campaign(user_id uuid, campaign_type text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN p.role != 'TRIAL' THEN true
      WHEN campaign_type = 'youtube' THEN 
        (SELECT COUNT(*) FROM public.campaigns c WHERE c.user_id = can_create_campaign.user_id AND c.video_type = 'youtube' AND c.deleted_at IS NULL) < 1
      WHEN campaign_type = 'page' THEN 
        (SELECT COUNT(*) FROM public.pages pg WHERE pg.user_id = can_create_campaign.user_id) < 1
      ELSE true
    END
  FROM public.profiles p
  WHERE p.id = can_create_campaign.user_id;