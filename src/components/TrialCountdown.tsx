import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTrialInfo } from "@/hooks/useTrialInfo";
import { Clock } from "lucide-react";

const PAYMENT_URL = "https://your-checkout-link.example"; // Replace with actual payment URL

export const TrialCountdown: React.FC = () => {
  const { data: trialInfo, isLoading } = useTrialInfo();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!trialInfo?.trial_ends_at) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = new Date(trialInfo.trial_ends_at!).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [trialInfo?.trial_ends_at]);

  const handleUpgrade = () => {
    window.open(PAYMENT_URL, '_blank');
  };

  // Don't show countdown if not loading and user is not on trial or trial is not active
  if (isLoading || !trialInfo || trialInfo.role !== 'TRIAL' || !trialInfo.is_active) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          Trial: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
        </span>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleUpgrade}
        className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
      >
        Upgrade
      </Button>
    </div>
  );
};