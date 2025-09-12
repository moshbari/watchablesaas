import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Video, Users, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useTrialInfo } from "@/hooks/useTrialInfo";
import { TrialOnboarding } from "@/components/TrialOnboarding";

const Index = () => {
  const { session } = useAuth();
  const { data: trialInfo } = useTrialInfo();
  
  // Show trial onboarding for logged-in trial users
  if (session && trialInfo?.role === 'TRIAL' && trialInfo.is_active) {
    return <TrialOnboarding />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent mb-6">
              Create Watchable Videos
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transform your videos into interactive experiences with custom overlays, timed buttons, and advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                  <Link to="/campaigns">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                    <Link to="/register">Start Free Trial</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to create engaging videos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to enhance your video content and drive better engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Interactive Videos</h3>
              <p className="text-muted-foreground">
                Add custom play buttons, overlays, and timed interactions to any video
              </p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Embedding</h3>
              <p className="text-muted-foreground">
                Generate embed codes and JavaScript snippets for seamless integration
              </p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <BarChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Analytics</h3>
              <p className="text-muted-foreground">
                Track engagement, view times, and interaction rates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using Watchables to enhance their video content.
          </p>
          {!session && (
            <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
              <Link to="/register">Start Your Free Trial</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;