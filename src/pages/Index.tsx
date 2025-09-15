import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Video, Users, BarChart, Play, Zap, Globe, Target, Smartphone, GraduationCap } from "lucide-react";
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <Card className="mb-8">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
              Distraction-Free Video Player
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Launch high-converting video pages in under 59 seconds—without tech skills, endless tools, or expensive hosting.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <Button asChild size="lg" className="text-lg px-8 py-3">
                  <Link to="/campaigns">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-3">
                    <Link to="/register">Start Free Trial</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Video Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <iframe 
                  src="https://watchable.99dfy.com/embed?video=https%253A%252F%252Fyoutu.be%252FsvS-ZzkgtBQ&playButtonColor=%2523ff0000&playButtonSize=96" 
                  width="800" 
                  height="450" 
                  frameBorder="0" 
                  allowFullScreen 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  className="w-full h-auto aspect-video rounded-lg border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Launch in 59 Seconds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Just pick a headline template, paste in a video, add your link, and click publish. Start earning today, not months from now.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Unlimited Everything</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No hidden limits, no surprise costs. Whether it's your first page or your 100th, you'll never get shut down.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">40+ Proven Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No need to "be a copywriter." Fill in a few blanks and your page looks professional instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Smart Button Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Choose exactly when your button appears—after 5 seconds, 30 seconds, or 10 minutes for maximum engagement.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Mobile-Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Forget coding or plugins. Just hit publish, and your page is live instantly—fast, secure, and mobile-ready.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Quick Start Training</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Watch once, and you'll know exactly how to launch your first page. No overwhelm—just results.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">Real Results from Real Users</CardTitle>
            <CardDescription className="text-lg">
              Watchable has already helped complete beginners launch and profit in weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-card border">
                <p className="text-lg font-semibold mb-2">Nathan</p>
                <p className="text-muted-foreground">
                  Made <span className="font-bold text-foreground">$1,248 in just 2 weeks</span> with 486 clicks.
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-card border">
                <p className="text-lg font-semibold mb-2">Petra</p>
                <p className="text-muted-foreground">
                  Earned <span className="font-bold text-foreground">$2,000</span> from 684 visitors.
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-card border">
                <p className="text-lg font-semibold mb-2">Ruby</p>
                <p className="text-muted-foreground">
                  Made <span className="font-bold text-foreground">$3,137 in passive commissions</span> in under 2 months.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Try It Free. Risk-Free.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg bg-muted/50 border">
                <p className="font-semibold text-lg mb-2">17-Day Free Trial</p>
                <p className="text-muted-foreground">No credit card required</p>
              </div>
              
              <div className="p-6 rounded-lg bg-muted/50 border">
                <p className="font-semibold text-lg mb-2">Keep Forever</p>
                <p className="text-muted-foreground">1 page + 1 video—even if you don't upgrade</p>
              </div>
              
              <div className="p-6 rounded-lg bg-muted/50 border">
                <p className="font-semibold text-lg mb-2">Upgrade Anytime</p>
                <p className="text-muted-foreground">Unlimited everything for just $19/month</p>
              </div>
            </div>
            
            {!session && (
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/register">Start Your Free Trial</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;