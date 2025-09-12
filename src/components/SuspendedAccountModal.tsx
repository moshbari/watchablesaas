import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const PAYMENT_URL = "https://your-checkout-link.example"; // Replace with actual payment URL

interface SuspendedAccountModalProps {
  isOpen: boolean;
}

export const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({ isOpen }) => {
  const handleUpgrade = () => {
    window.open(PAYMENT_URL, '_blank');
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Account Expired. Please Upgrade to Unlimited
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your 17-day trial is over. Upgrade to continue using all features.
          </p>
          <Button 
            onClick={handleUpgrade}
            className="w-full"
            size="lg"
          >
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};