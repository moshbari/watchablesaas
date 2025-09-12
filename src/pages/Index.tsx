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
              🚀 Stop Perfecting. Start Profiting.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Launch money-making pages in under 60 seconds—without tech skills, endless tools, or expensive hosting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                  <Link to="/campaigns">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6 h-auto text-white">
                    <Link to="/register">Start Free Trial – No Credit Card Required</Link>
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

      {/* Why People Fail Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              ❌ Why Most People Never Launch
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-lg bg-card border">
              <p className="text-lg text-muted-foreground leading-relaxed">
                They waste months building a "perfect" website that never goes live.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card border">
              <p className="text-lg text-muted-foreground leading-relaxed">
                They get stuck comparing tools like ClickFunnels, GoHighLevel, or WordPress.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card border">
              <p className="text-lg text-muted-foreground leading-relaxed">
                They lose traffic to YouTube distractions—or pay crazy fees for hosting.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl font-semibold text-destructive">
              👉 Result: No launch. No sales. No momentum.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <iframe 
                src="https://watchable.99dfy.com/embed?video=https%253A%252F%252Fyoutu.be%252FsvS-ZzkgtBQ&playButtonColor=%2523ff0000&playButtonSize=96" 
                width="800" 
                height="450" 
                frameBorder="0" 
                allowFullScreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="w-full h-auto aspect-video rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              We built Watchable to remove every roadblock keeping you stuck.
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-lg bg-card border">
              <h3 className="text-xl font-bold mb-4">⚡ Launch in Under 60 Seconds</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Just pick a headline template, paste in a video, add your link, and click publish.
              </p>
              <p className="text-sm font-medium text-primary">
                → This means you can start earning today, not months from now.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-card border">
              <h3 className="text-xl font-bold mb-4">🎬 Unlimited Pages, Unlimited Videos, Unlimited Bandwidth</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                No hidden limits, no surprise costs. Whether it's your first page or your 100th, you'll never get shut down.
              </p>
              <p className="text-sm font-medium text-primary">
                → This means you can scale freely without paying extra fees.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-card border">
              <h3 className="text-xl font-bold mb-4">✍️ 40+ Proven Headline Templates</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                No need to "be a copywriter." Fill in a few blanks and your page looks pro.
              </p>
              <p className="text-sm font-medium text-primary">
                → This means no writer's block, no stress, and no wasted time.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-card border">
              <h3 className="text-xl font-bold mb-4">🎯 Delayed Buy Button Control</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Choose exactly when your button appears—after 5 seconds, 30 seconds, or 10 minutes.
              </p>
              <p className="text-sm font-medium text-primary">
                → This means visitors stay engaged with your message before they click.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-card border">
              <h3 className="text-xl font-bold mb-4">📱 Mobile-Ready & One-Click Publishing</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Forget coding or plugins. Just hit publish, and your page is live instantly—fast, secure, and mobile-ready.
              </p>
              <p className="text-sm font-medium text-primary">
                → This means you look professional from day one, without design skills.
              </p>
            </div>

            <div className="p-8 rounded-lg bg-card border">
              <h3 className="text-xl font-bold mb-4">🎥 5-Minute Quick Start Training</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Watch once, and you'll know exactly how to launch your first page.
              </p>
              <p className="text-sm font-medium text-primary">
                → This means no overwhelm—just a clear path to go live today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Real People. Real Results. Real Fast.
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Watchable has already helped complete beginners launch and profit in weeks:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <p className="text-lg font-semibold mb-2">Nathan</p>
              <p className="text-muted-foreground">
                made <span className="font-bold text-green-600">$1,248 in just 2 weeks</span> with 486 clicks.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <p className="text-lg font-semibold mb-2">Petra (retired professor)</p>
              <p className="text-muted-foreground">
                earned <span className="font-bold text-green-600">$2,000</span> from 684 visitors.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <p className="text-lg font-semibold mb-2">Ruby (stay-at-home mom)</p>
              <p className="text-muted-foreground">
                made <span className="font-bold text-green-600">$3,137 in passive commissions</span> + 13,000 followers in under 2 months.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg italic text-muted-foreground">
              They didn't build perfect websites. They used Watchable's simple, interactive pages.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            🎁 Try It Free. Risk-Free.
          </h2>
          
          <div className="max-w-3xl mx-auto mb-12">
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-lg bg-card/50 border">
                <p className="font-semibold text-lg mb-2">27-Day Free Test Drive</p>
                <p className="text-muted-foreground">(no credit card required)</p>
              </div>
              
              <div className="p-6 rounded-lg bg-card/50 border">
                <p className="font-semibold text-lg mb-2">Keep Forever</p>
                <p className="text-muted-foreground">1 page + 1 video—even if you don't upgrade</p>
              </div>
              
              <div className="p-6 rounded-lg bg-card/50 border">
                <p className="font-semibold text-lg mb-2">Upgrade Later</p>
                <p className="text-muted-foreground">Unlimited pages, videos, and bandwidth for just $19/month FOREVER</p>
              </div>
            </div>
          </div>
          
          <p className="text-xl font-semibold mb-8">
            👉 No risk. No excuses. No more waiting.
          </p>
          
          {!session && (
            <Button asChild size="lg" className="text-xl px-12 py-8 h-auto text-white">
              <Link to="/register">Start Your Free Trial</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;