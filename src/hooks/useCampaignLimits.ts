import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

export const useCampaignLimits = () => {
  const { user } = useAuth();

  const canCreateVideo = useQuery({
    queryKey: ['can-create-campaign', user?.id, 'youtube'],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('can_create_campaign', { 
          user_id: user.id, 
          campaign_type: 'youtube' 
        });

      if (error) {
        console.error('Error checking video campaign limits:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user?.id,
  });

  const canCreatePage = useQuery({
    queryKey: ['can-create-campaign', user?.id, 'page'],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('can_create_campaign', { 
          user_id: user.id, 
          campaign_type: 'page' 
        });

      if (error) {
        console.error('Error checking page campaign limits:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user?.id,
  });

  return {
    canCreateVideo: canCreateVideo.data ?? false,
    canCreatePage: canCreatePage.data ?? false,
    isLoading: canCreateVideo.isLoading || canCreatePage.isLoading,
  };
};