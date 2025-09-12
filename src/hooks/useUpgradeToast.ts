import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthProvider";

export const useUpgradeToast = () => {
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    // Check if user was just upgraded (you could implement this with a query param or localStorage)
    const urlParams = new URLSearchParams(window.location.search);
    const upgraded = urlParams.get('upgraded');
    
    if (upgraded === 'true' && profile?.role === 'UNLIMITED') {
      toast({
        title: "Thanks for upgrading!",
        description: "Unlimited features unlocked.",
        duration: 5000,
      });
      
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [profile?.role, toast]);
};