import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';

interface LeadOptinModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  userId: string;
  nameEnabled: boolean;
  nameRequired: boolean;
  emailEnabled: boolean;
  emailRequired: boolean;
  phoneEnabled: boolean;
  phoneRequired: boolean;
  isMandatory?: boolean;
  headline?: string;
  description?: string;
  buttonText?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export const LeadOptinModal: React.FC<LeadOptinModalProps> = ({
  isOpen,
  onClose,
  pageId,
  userId,
  nameEnabled,
  nameRequired,
  emailEnabled,
  emailRequired,
  phoneEnabled,
  phoneRequired,
  isMandatory = false,
  headline = 'Become a Member',
  description = 'Enter your information to watch this exclusive video',
  buttonText = 'Join to Watch Video',
  buttonBgColor = '#000000',
  buttonTextColor = '#ffffff'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    consent: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (nameEnabled && nameRequired && !formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    if (emailEnabled && emailRequired && !formData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }
    
    if (phoneEnabled && phoneRequired && !formData.phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate consent checkbox
    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please accept that we may contact you",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation if email is provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const leadData: any = {
        page_id: pageId,
        user_id: userId,
        consent_given: formData.consent,
      };

      if (nameEnabled && formData.name) leadData.name = formData.name.trim();
      if (emailEnabled && formData.email) leadData.email = formData.email.trim();
      if (phoneEnabled && formData.phone) leadData.phone = formData.phone.trim();

      const { error } = await supabase
        .from('leads')
        .insert([leadData]);

      if (error) throw error;

      toast({
        title: "Welcome!",
        description: "You can now watch the video",
      });

      // Store in sessionStorage to remember this user opted in
      sessionStorage.setItem(`lead_optin_${pageId}`, 'true');
      
      onClose();
    } catch (error: any) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // If mandatory, prevent closing unless loading is done
      // If not mandatory, allow closing anytime (except during loading)
      if (!open && !loading && !isMandatory) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        // Prevent closing on outside click if mandatory
        if (isMandatory) {
          e.preventDefault();
        }
      }} onEscapeKeyDown={(e) => {
        // Prevent closing on escape key if mandatory
        if (isMandatory) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{headline}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {nameEnabled && (
            <div className="space-y-2">
              <Label htmlFor="name">
                Name {nameRequired && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                required={nameRequired}
                disabled={loading}
                className="border-2 border-border"
              />
            </div>
          )}

          {emailEnabled && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email {emailRequired && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                required={emailRequired}
                disabled={loading}
                className="border-2 border-border"
              />
            </div>
          )}

          {phoneEnabled && (
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone {phoneRequired && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                required={phoneRequired}
                disabled={loading}
                className="border-2 border-border"
              />
            </div>
          )}

          <div className="flex items-start space-x-2 py-4">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, consent: checked as boolean }))
              }
              disabled={loading}
            />
            <Label 
              htmlFor="consent" 
              className="text-sm leading-tight cursor-pointer"
            >
              I agree to be contacted regarding this video and related content <span className="text-destructive">*</span>
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2" 
            disabled={loading}
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor
            }}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
            <ArrowRight className="h-4 w-4" style={{ color: buttonTextColor }} />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
