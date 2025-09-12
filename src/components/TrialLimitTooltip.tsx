import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface TrialLimitTooltipProps {
  children: React.ReactNode;
  disabled: boolean;
}

export const TrialLimitTooltip: React.FC<TrialLimitTooltipProps> = ({ children, disabled }) => {
  if (!disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            <div className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center cursor-not-allowed">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Limit reached on trial</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};