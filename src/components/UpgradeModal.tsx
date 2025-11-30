import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignType: "video" | "page";
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, campaignType }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    window.location.href = "https://59s.site/#pricing";
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade Your Account</AlertDialogTitle>
          <AlertDialogDescription>
            You've reached the limit for creating {campaignType === "video" ? "video campaigns" : "pages"} on your trial account.
            Upgrade your account to create more campaigns and unlock unlimited features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
