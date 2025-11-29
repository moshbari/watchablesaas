import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import youtubeDistractionsImage from '@/assets/youtube_player_distractions.jpg';
import cleanPlayerAfter from '@/assets/clean_player_after.png';

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255)
});

export default function Landing() {
  const [email, setEmail] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [counter, setCounter] = useState(5753);
  const { toast } = useToast();

  useEffect(() => {
    // Countdown animation
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && counter > 5000) {
        setCounter(prev => prev - 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [counter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast({
        title: "Invalid Email",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Redirecting to your free trial...",
    });
    
    // Redirect or handle signup
    // window.location.href = `/signup?email=${encodeURIComponent(email)}`;
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Is this really free for 17 days?",
      answer: "Yes. Completely free. No credit card required. No sneaky auto-billing. You can use every feature, build unlimited pages, and test it thoroughly. After 17 days, if you want to keep using it, you pay $27/month. If not, just don't do anything - your trial ends and that's it. No charges. No questions asked."
    },
    {
      question: "Can I really build pages from my phone?",
      answer: "Absolutely. 68% of our users build pages from their phones. The voice input works on any device - iPhone, Android, tablet, desktop. You can literally build a complete webinar funnel while waiting in line at Starbucks."
    },
    {
      question: "What happens after 17 days?",
      answer: "Two options: (1) You love it and keep it for $27/month, or (2) You cancel before day 17 and pay nothing. We'll send you a reminder on day 15 so you're never surprised. No automatic billing until you explicitly confirm you want to continue."
    },
    {
      question: "Do I need coding or design skills?",
      answer: "Zero. None. Nada. That's the whole point. You talk, AI builds. If you can describe what you want in a sentence, you can build a page. No HTML. No CSS. No dragging and dropping. Just talking."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. One click in your account settings. No \"contact us to cancel\" nonsense. No retention team calling you. Click \"Cancel\" and you're done. We'll miss you, but we won't make it hard."
    },
    {
      question: "Is there a limit on pages I can build?",
      answer: "No. Build 10 pages or 10,000 pages. Same price. We don't do the \"tiered pricing based on page count\" thing. Unlimited means unlimited."
    },
    {
      question: "Why is the price going up to $47?",
      answer: "We're in early growth mode. Right now we're focused on getting users, gathering feedback, and building case studies. The $27 price helps us grow fast. Once we hit 10,000 users (we're at 4,247 now), we'll have enough proof of concept to justify raising the price to $47 - which is still cheaper than any competitor. Everyone who signs up at $27 keeps that price forever as long as they stay subscribed."
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-container nav-container">
          <a href="#" className="landing-logo">
            Watch<span className="logo-accent">able</span>
          </a>
          <ul className="landing-nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><Button className="landing-btn-primary">Start Free Trial</Button></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container landing-text-center">
          <div className="landing-trust-badge">
            🔒 Trusted by 4,200+ marketers | ⭐ 4.8/5 rating
          </div>

          <h1 className="landing-hero-headline landing-fade-in">
            I Fired My $85/Hour Web Developer<br />
            And Replaced Him With My Voice
          </h1>

          <div className="landing-hero-subheadline landing-fade-in">
            <p>Last month, I paid a developer <span className="landing-highlight-orange">$1,275</span> to build a simple webinar funnel.</p>
            <p>It took him <strong>8 days</strong>.</p>
            <p className="landing-mt-s">Yesterday, I built the same funnel in <span className="landing-highlight-orange">59 seconds</span>. From my phone. Using only my voice.</p>
          </div>

          <form className="landing-cta-form landing-fade-in" onSubmit={handleSubmit}>
            <Input
              type="email"
              className="landing-email-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="landing-btn-primary landing-btn-large">
              Start Free Trial →
            </Button>
          </form>

          <div className="landing-trust-points landing-fade-in">
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>17-day free trial</span>
            </div>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>Cancel anytime</span>
            </div>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>Setup in 2 minutes</span>
            </div>
          </div>

          <div className="landing-hero-visual landing-fade-in">
            <center>
              <iframe 
                src="https://59s.site/embed?video=https%3A%2F%2Fwww.tella.tv%2Fvideo%2F59ssite-built-just-with-ai-b6dt&playButtonColor=%23ff0000&playButtonSize=96" 
                width="800" 
                height="450" 
                frameBorder="0" 
                allowFullScreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                style={{ maxWidth: '100%', height: 'auto', aspectRatio: '16/9' }}
                title="Watchable Demo - Building a page in 59 seconds"
              />
            </center>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="landing-trust-bar">
        <div className="landing-container landing-text-center">
          <p className="landing-trust-label">As Featured In</p>
          <div className="landing-logo-strip">
            <span>ProductHunt</span>
            <span>G2</span>
            <span>Capterra</span>
            <span>TrustPilot</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">You're Tired Of...</h2>

          <div className="landing-problem-grid">
            <div className="landing-problem-card">
              <div className="landing-problem-icon">💸</div>
              <h4 className="landing-problem-title">Paying $147/month</h4>
              <p className="landing-problem-text">For tools like ClickFunnels that you barely use. You need 5% of the features but pay for 100%.</p>
            </div>

            <div className="landing-problem-card">
              <div className="landing-problem-icon">⏰</div>
              <h4 className="landing-problem-title">Waiting 2 weeks</h4>
              <p className="landing-problem-text">For developers to finish simple tasks. By the time the page is ready, the opportunity is gone.</p>
            </div>

            <div className="landing-problem-card">
              <div className="landing-problem-icon">🤯</div>
              <h4 className="landing-problem-title">Complicated tools</h4>
              <p className="landing-problem-text">With 847 features you'll never use. You just want a simple page, not a spaceship control panel.</p>
            </div>
          </div>

          <div className="landing-text-center landing-mt-l">
            <Button className="landing-btn-primary">See The Solution →</Button>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-solution-split">
            <div className="landing-solution-image">
              <img src="https://placehold.co/600x400/0A2463/FFFFFF?text=Watchable+Interface" alt="Watchable voice-powered interface" />
            </div>

            <div className="landing-solution-content">
              <h2>What If You Could Build Pages By Just... Talking?</h2>

              <p>Here's what happened to me 6 months ago.</p>

              <p>I was exactly where you are now. Frustrated. Overpaying. Wasting time.</p>

              <p>Then I found something that changed everything.</p>

              <p><strong>A tool called Watchable.</strong></p>

              <div className="landing-quote-highlight">
                "Holy shit. This is what I've been looking for."
              </div>

              <p>I clicked "Create New Page." I saw a microphone button. I clicked it.</p>

              <p><strong>And I just... talked.</strong></p>

              <p>59 seconds later, the page was done. Headline written. Layout perfect. Pop-up configured. Button delayed to 5 seconds.</p>

              <Button className="landing-btn-primary landing-mt-m">Watch 59-Second Demo →</Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">Here's How Stupidly Simple This Is</h2>

          <div className="landing-steps-container">
            {[
              {
                number: "1",
                title: 'Click "Create New Page"',
                description: "That's it. One button. No templates to browse. No layouts to choose. Just click."
              },
              {
                number: "2",
                title: "Tell It What You Want (Using Your Voice)",
                description: "Click the microphone. Talk. Describe your page like you're explaining it to a friend. The AI listens, understands, and builds."
              },
              {
                number: "3",
                title: "Watch the Magic Happen",
                description: "AI generates your headline, sub-headline, formatting, call-to-action button, and pop-up opt-in form. In under 60 seconds."
              },
              {
                number: "4",
                title: "Add Your Video",
                description: "Got a YouTube or Vimeo video? Paste the URL. Done. Our locked player removes all distractions."
              },
              {
                number: "5",
                title: "Go Live",
                description: "Click \"Publish.\" Your page is live. Share the link. Send traffic. Collect leads. Make money."
              }
            ].map((step, index) => (
              <div key={index} className="landing-step">
                <div className="landing-step-number">{step.number}</div>
                <div className="landing-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Killer Feature */}
      <section className="landing-section landing-section-dark">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl" style={{ color: 'white' }}>The Feature That Changes Everything</h2>

          <div className="landing-comparison">
            <div className="landing-comparison-card">
              <p className="landing-comparison-label landing-before">BEFORE:</p>
              <div className="landing-comparison-image">
                <img 
                  src={youtubeDistractionsImage} 
                  alt="YouTube player with distracting links and suggestions" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
              <ul className="landing-comparison-points" style={{ color: 'hsl(var(--landing-navy-deep))' }}>
                <li><span className="landing-table-x">✗</span> Visitors click away</li>
                <li><span className="landing-table-x">✗</span> You lose the sale</li>
                <li><span className="landing-table-x">✗</span> Distracted viewers</li>
              </ul>
            </div>

            <div className="landing-vs-divider">VS</div>

            <div className="landing-comparison-card">
              <p className="landing-comparison-label landing-after">AFTER:</p>
              <div className="landing-comparison-image">
                <img 
                  src={cleanPlayerAfter} 
                  alt="Clean distraction-free video player" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
              <ul className="landing-comparison-points" style={{ color: 'hsl(var(--landing-navy-deep))' }}>
                <li><span className="landing-table-check">✓</span> Visitors watch full video</li>
                <li><span className="landing-table-check">✓</span> You make the sale</li>
                <li><span className="landing-table-check">✓</span> Zero distractions</li>
              </ul>
            </div>
          </div>

          <p className="landing-text-center landing-mt-l landing-text-large" style={{ color: 'var(--landing-orange-warm)', fontStyle: 'italic' }}>
            "This is how we made $1.4 million with webinar funnels."
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">Don't Just Take My Word For It</h2>

          <div className="landing-testimonials-grid">
            {[
              {
                name: "Sarah Mitchell",
                role: "Course Creator",
                photo: "👩",
                quote: "I built 4 product launch funnels in one weekend. All from my iPad. I used to pay my developer $800 per funnel. Now? I build them myself in under 10 minutes."
              },
              {
                name: "Marcus Chen",
                role: "Affiliate Marketer",
                photo: "👨",
                quote: "This paid for itself in the first 3 hours. I've built 47 pages in 6 months. That's 94 hours saved. At my hourly rate, Watchable saved me $4,700."
              },
              {
                name: "David Rodriguez",
                role: "Real Estate Agent",
                photo: "👨‍💼",
                quote: "I build listing pages while driving between showings. My wife thought I hired someone. Nope. Just me and my voice. Saving $2,700/year."
              },
              {
                name: "Jennifer Adams",
                role: "Online Coach",
                photo: "👩‍💻",
                quote: "I cancelled my $297/month Kartra subscription. Watchable does exactly what I need for $27. That's $3,240/year saved. That's a vacation with my kids."
              }
            ].map((testimonial, index) => (
              <div key={index} className="landing-testimonial-card">
                <div className="landing-stars">⭐⭐⭐⭐⭐</div>
                <div className="landing-testimonial-photo">{testimonial.photo}</div>
                <p className="landing-testimonial-quote">{testimonial.quote}</p>
                <p className="landing-testimonial-author">{testimonial.name}</p>
                <p className="landing-testimonial-role">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">The Numbers Don't Lie</h2>

          <div className="landing-stats-grid">
            {[
              { number: "4,247", label: "Pages Built\n(Last 30 Days)" },
              { number: "2:14", label: "Average\nBuild Time" },
              { number: "68%", label: "Built on\nMobile Devices" },
              { number: "$120", label: "Avg Monthly\nSavings" },
              { number: "4.8/5", label: "Star Rating\n(1,829 reviews)" },
              { number: "94%", label: "Customer\nRetention Rate" }
            ].map((stat, index) => (
              <div key={index} className="landing-stat-card">
                <span className="landing-stat-number">{stat.number}</span>
                <p className="landing-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">How Watchable Compares</h2>

          <div className="landing-comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="landing-highlight-column">Watchable</th>
                  <th>ClickFunnels</th>
                  <th>Leadpages</th>
                  <th>WordPress</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Price/month</strong></td>
                  <td className="landing-highlight-column"><strong>$27</strong> <span className="landing-table-check">✓</span></td>
                  <td>$147 <span className="landing-table-x">✗</span></td>
                  <td>$79 <span className="landing-table-x">✗</span></td>
                  <td>$50+ <span className="landing-table-x">✗</span></td>
                </tr>
                <tr>
                  <td><strong>Voice Builder</strong></td>
                  <td className="landing-highlight-column"><span className="landing-table-check">✓</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                </tr>
                <tr>
                  <td><strong>Mobile Creation</strong></td>
                  <td className="landing-highlight-column"><span className="landing-table-check">✓</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td>Limited</td>
                  <td><span className="landing-table-x">✗</span></td>
                </tr>
                <tr>
                  <td><strong>AI Builder</strong></td>
                  <td className="landing-highlight-column"><span className="landing-table-check">✓</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                </tr>
                <tr>
                  <td><strong>Setup Time</strong></td>
                  <td className="landing-highlight-column">2 min <span className="landing-table-check">✓</span></td>
                  <td>30+ min</td>
                  <td>15 min</td>
                  <td>Hours</td>
                </tr>
                <tr>
                  <td><strong>Locked Player</strong></td>
                  <td className="landing-highlight-column"><span className="landing-table-check">✓</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                  <td><span className="landing-table-x">✗</span></td>
                </tr>
                <tr>
                  <td><strong>Free Trial</strong></td>
                  <td className="landing-highlight-column">17 days</td>
                  <td>14 days</td>
                  <td>14 days</td>
                  <td><span className="landing-table-x">✗</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="landing-section">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">Simple, Honest Pricing</h2>

          <div className="landing-pricing-card">
            <div className="landing-popular-badge">Most Popular</div>

            <div className="landing-price">
              $27<span className="landing-price-period">/month</span>
            </div>

            <ul className="landing-features-list">
              {[
                "Unlimited pages",
                "Voice-powered AI builder",
                "Mobile + Desktop creation",
                "Locked video player",
                "Analytics dashboard",
                "Priority support"
              ].map((feature, index) => (
                <li key={index}>
                  <span className="landing-checkmark">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="landing-btn-primary landing-btn-large landing-btn-block" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
              Start 17-Day Free Trial
            </Button>

            <p className="landing-text-center landing-text-small landing-mt-xs" style={{ color: 'var(--landing-gray-medium)' }}>
              No credit card required
            </p>

            <div className="landing-urgency-box">
              <p className="landing-urgency-text">
                ⚡ Lock in $27 before price increases to $47
              </p>
            </div>

            <div className="landing-trust-badges-row">
              <span>🔒 256-bit SSL</span>
              <span>💳 Secure Payment</span>
              <span>↩️ Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="landing-text-center landing-mb-xl">Frequently Asked Questions</h2>

          <div className="landing-faq-container">
            {faqs.map((faq, index) => (
              <div key={index} className={`landing-faq-item ${activeFaq === index ? 'active' : ''}`}>
                <button className="landing-faq-question" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <span className="landing-faq-icon">▼</span>
                </button>
                <div className="landing-faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="landing-section landing-final-cta landing-section-dark">
        <div className="landing-container landing-text-center">
          <h2 className="landing-mb-l">
            Stop Overpaying. Stop Waiting.<br />
            Start Building.
          </h2>

          <form className="landing-cta-form" onSubmit={handleSubmit}>
            <Input
              type="email"
              className="landing-email-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="landing-btn-primary landing-btn-large">
              Start Free Trial →
            </Button>
          </form>

          <div className="landing-trust-points" style={{ color: 'white' }}>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>17-day free trial</span>
            </div>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>Cancel anytime</span>
            </div>
            <div className="landing-trust-point">
              <span className="landing-checkmark">✓</span>
              <span>$27/month after trial</span>
            </div>
          </div>

          <div className="landing-countdown">
            ⏰ <span>{counter.toLocaleString()}</span> users left until price increases to $47
          </div>

          <div className="landing-trust-badges-row" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span>🔒 SSL Encrypted</span>
            <span>💳 Secure</span>
            <span>⭐ 4.8/5 Rating</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-section">
              <h4>Product</h4>
              <ul className="landing-footer-links">
                <li><a href="#how-it-works">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">Roadmap</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>

            <div className="landing-footer-section">
              <h4>Company</h4>
              <ul className="landing-footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press Kit</a></li>
              </ul>
            </div>

            <div className="landing-footer-section">
              <h4>Legal</h4>
              <ul className="landing-footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Refund Policy</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>

            <div className="landing-footer-section">
              <h4>Contact</h4>
              <div className="landing-contact-box">
                <p>📧 support@watchable.app</p>
                <p>💬 Live chat: Mon-Fri 9am-6pm EST</p>
                <p>🏢 San Francisco, CA</p>
              </div>
            </div>
          </div>

          <div className="landing-social-links">
            <a href="#" className="landing-social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="landing-social-link" aria-label="LinkedIn">💼</a>
            <a href="#" className="landing-social-link" aria-label="YouTube">📺</a>
            <a href="#" className="landing-social-link" aria-label="Facebook">📘</a>
          </div>

          <div className="landing-footer-bottom">
            <p>© 2025 Watchable. All rights reserved.</p>
            <p className="landing-mt-xs">🔒 256-bit SSL Encryption | 🛡️ SOC 2 Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
