import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCampaignLimits } from "@/hooks/useCampaignLimits";
import { TrialLimitTooltip } from "./TrialLimitTooltip";

export const TrialOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateVideo, canCreatePage } = useCampaignLimits();

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Welcome to Your Trial!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You have 17 days to explore our platform. Get started by creating your first campaigns.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Video Campaign</CardTitle>
            <CardDescription>
              Build engaging video campaigns with custom overlays and interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {canCreateVideo ? "1 of 1 allowed on trial" : "Trial limit reached"}
            </p>
            <TrialLimitTooltip disabled={!canCreateVideo}>
              <Button 
                className="w-full" 
                size="lg"
                disabled={!canCreateVideo}
                onClick={() => navigate('/campaigns')}
              >
                Create Video Campaign
              </Button>
            </TrialLimitTooltip>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Page-Builder Campaign</CardTitle>
            <CardDescription>
              Design beautiful landing pages with our drag-and-drop builder
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {canCreatePage ? "1 of 1 allowed on trial" : "Trial limit reached"}
            </p>
            <TrialLimitTooltip disabled={!canCreatePage}>
              <Button 
                className="w-full" 
                size="lg"
                disabled={!canCreatePage}
                onClick={() => navigate('/page-builder')}
              >
                Create Page Campaign
              </Button>
            </TrialLimitTooltip>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};