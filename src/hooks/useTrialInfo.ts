import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

interface TrialInfo {
  role: 'TRIAL' | 'UNLIMITED' | 'SUSPENDED' | 'admin';
  trial_started_at: string | null;
  trial_ends_at: string | null;
  is_active: boolean;
}

export const useTrialInfo = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trial-info', user?.id],
    queryFn: async (): Promise<TrialInfo | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_trial_info', { user_id: user.id });

      if (error) {
        console.error('Error fetching trial info:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute to keep countdown accurate
  });
};