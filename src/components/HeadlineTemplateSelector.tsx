import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Star } from 'lucide-react';

interface HeadlineTemplate {
  id: number;
  headline: string;
  subHeadline: string;
  rating: number;
  reason: string;
  placeholders: string[];
}

const templates: HeadlineTemplate[] = [
  // ⭐⭐⭐⭐⭐ 5-STAR TEMPLATES (5/5 Rating) - Highest Converting ⭐⭐⭐⭐⭐
  {
    id: 1,
    headline: "How [Target Audience] [Achieve Desired Result] In [Time Frame] Without [Common Obstacle]",
    subHeadline: "The proven [Number]-step system that [Specific Benefit] - even if [Common Objection]",
    rating: 5,
    reason: "Contains specificity, time constraint, removes friction, addresses objections. Classic conversion formula.",
    placeholders: ["Target Audience", "Achieve Desired Result", "Time Frame", "Common Obstacle", "Number", "Specific Benefit", "Common Objection"]
  },
  {
    id: 3,
    headline: "WARNING: [Problem] Is Costing You $[Amount] Every [Time Period]",
    subHeadline: "Here's how to stop the bleeding and [Specific Solution] starting [Time Frame]",
    rating: 5,
    reason: "Creates urgency, quantifies problem, positions solution. Strong pain-avoidance trigger.",
    placeholders: ["Problem", "Amount", "Time Period", "Specific Solution", "Time Frame"]
  },
  {
    id: 5,
    headline: "If You [Qualifying Condition], This [Product] Will [Specific Promise] or Your Money Back",
    subHeadline: "100% guaranteed results for [Target Audience] who [Specific Action/Behavior]",
    rating: 5,
    reason: "Qualification + guarantee + specificity = high conversion. Risk reversal is powerful.",
    placeholders: ["Qualifying Condition", "Product", "Specific Promise", "Target Audience", "Specific Action/Behavior"]
  },
  {
    id: 8,
    headline: "PROOF: [Specific Claim] [Achievement] Using This [Simple Description]",
    subHeadline: "See the documented evidence and get the same results for yourself",
    rating: 5,
    reason: "Evidence-based, reduces skepticism, builds credibility. \"PROOF\" is powerful word.",
    placeholders: ["Specific Claim", "Achievement", "Simple Description"]
  },
  {
    id: 13,
    headline: "How To [Achieve Goal] Even If [Common Excuse/Limitation]",
    subHeadline: "The breakthrough method that works regardless of [Limitation] or [Another Limitation]",
    rating: 5,
    reason: "Removes objections, inclusive, addresses common barriers. Highly relatable.",
    placeholders: ["Achieve Goal", "Common Excuse/Limitation", "Limitation", "Another Limitation"]
  },
  {
    id: 18,
    headline: "[Specific Number]% Of [Target Audience] Make This [Mistake] - Don't Be One Of Them",
    subHeadline: "Avoid the costly error that [Negative Consequence] and learn what [Success Group] do instead",
    rating: 5,
    reason: "Statistics, fear of missing out, positions reader choice. Very persuasive formula.",
    placeholders: ["Specific Number", "Target Audience", "Mistake", "Negative Consequence", "Success Group"]
  },
  {
    id: 19,
    headline: "Copy My Exact [Process/System] That [Specific Achievement]",
    subHeadline: "Step-by-step blueprint that [Benefit] - no guesswork, no [Common Frustration]",
    rating: 5,
    reason: "Copycat appeal, removes uncertainty, promises specificity. Strong for how-to products.",
    placeholders: ["Process/System", "Specific Achievement", "Benefit", "Common Frustration"]
  },
  {
    id: 25,
    headline: "[Exact Result] In [Specific Time] Or It's Free",
    subHeadline: "Our [Guarantee Period] guarantee: Get [Specific Outcome] or pay nothing",
    rating: 5,
    reason: "Strong guarantee, risk reversal, specific promise. Powerful conversion driver.",
    placeholders: ["Exact Result", "Specific Time", "Guarantee Period", "Specific Outcome"]
  },
  {
    id: 27,
    headline: "The Shocking Truth About [Topic]—And How It's Costing You [Pain/Money]",
    subHeadline: "Discover why [Audience] fail—and how you can flip the script today.",
    rating: 5,
    reason: "Curiosity + pain agitation. Classic proven hook.",
    placeholders: ["Topic", "Pain/Money", "Audience"]
  },
  {
    id: 28,
    headline: "Finally! A Simple Way to [Desired Result] Without [Dreaded Thing]",
    subHeadline: "Forget [Frustration]. This does the heavy lifting so you don't have to.",
    rating: 5,
    reason: "Relief + solution. Strong for saturated niches.",
    placeholders: ["Desired Result", "Dreaded Thing", "Frustration"]
  },
  {
    id: 29,
    headline: "Give Me [Short Timeframe] and I'll Show You How to [Desired Result]",
    subHeadline: "Fast, predictable results—even if you're starting from scratch.",
    rating: 5,
    reason: "Bold time-promise formula. Always converts.",
    placeholders: ["Short Timeframe", "Desired Result"]
  },
  {
    id: 32,
    headline: "Warning: Don't Even Think About [Topic] Until You [Do/Know This One Thing]",
    subHeadline: "Most [Audience] miss this step—and pay the price. Don't be one of them.",
    rating: 5,
    reason: "Fear + authority + urgency.",
    placeholders: ["Topic", "Do/Know This One Thing", "Audience"]
  },
  {
    id: 33,
    headline: "The Fastest, Easiest Way to [Desired Result] (Even If You're [Negative Self-Identity])",
    subHeadline: "Zero skills? Zero problem. This makes [Desired Result] possible.",
    rating: 5,
    reason: "Simplicity + inclusivity.",
    placeholders: ["Desired Result", "Negative Self-Identity"]
  },
  {
    id: 37,
    headline: "Breakthrough: [Audience] Can Now [Desired Result] Without [Pain Point]",
    subHeadline: "A brand-new way to crush [Goal] with almost no effort.",
    rating: 5,
    reason: "\"Breakthrough\" = high novelty appeal.",
    placeholders: ["Audience", "Desired Result", "Pain Point", "Goal"]
  },
  {
    id: 38,
    headline: "If You Can [Simple Action], You Can [Desired Result]",
    subHeadline: "No experience required—just follow the steps and get results.",
    rating: 5,
    reason: "Ultra-simple, removes barriers.",
    placeholders: ["Simple Action", "Desired Result"]
  },
  {
    id: 40,
    headline: "PROOF: [Specific Claim] [Achievement] Using This [Simple Description]",
    subHeadline: "See the documented evidence and get the same results for yourself.",
    rating: 5,
    reason: "Evidence-based, crushes skepticism.",
    placeholders: ["Specific Claim", "Achievement", "Simple Description"]
  },
  
  // ⭐⭐⭐⭐ 4-STAR TEMPLATES (4/5 Rating) - Strong Performers ⭐⭐⭐⭐
  {
    id: 2,
    headline: "The [Number] Secrets [Authority Figure] Don't Want You To Know About [Topic]",
    subHeadline: "Discover the insider methods that [Specific Result] used by [Credible Source]",
    rating: 4,
    reason: "Curiosity-driven, authority positioning, but can feel clickbaity without proper execution.",
    placeholders: ["Number", "Authority Figure", "Topic", "Specific Result", "Credible Source"]
  },
  {
    id: 4,
    headline: "Finally! A [Product Category] That [Unique Benefit] Without [Common Drawback]",
    subHeadline: "Say goodbye to [Frustration] and hello to [Desired Outcome] in just [Time Frame]",
    rating: 4,
    reason: "Addresses market sophistication, unique positioning, but \"Finally!\" can feel overused.",
    placeholders: ["Product Category", "Unique Benefit", "Common Drawback", "Frustration", "Desired Outcome", "Time Frame"]
  },
  {
    id: 6,
    headline: "[Number] [Time Period] Ago I Was [Negative State]. Today I [Positive State]",
    subHeadline: "The simple [Method/System] that changed everything - and how you can copy my exact blueprint",
    rating: 4,
    reason: "Story-driven, transformation proof, relatability. May need credibility markers.",
    placeholders: ["Number", "Time Period", "Negative State", "Positive State", "Method/System"]
  },
  {
    id: 7,
    headline: "The $[Amount] [Product/Service] That [Impressive Result] in [Time Frame]",
    subHeadline: "See the exact [Tool/Method] that [Specific Achievement] - no [Common Excuse] required",
    rating: 4,
    reason: "Price anchoring, result-focused, removes excuses. Needs strong proof elements.",
    placeholders: ["Amount", "Product/Service", "Impressive Result", "Time Frame", "Tool/Method", "Specific Achievement", "Common Excuse"]
  },
  {
    id: 9,
    headline: "Why [Common Belief] Is Dead Wrong (And What [Smart People] Do Instead)",
    subHeadline: "The counterintuitive approach that [Specific Benefit] while everyone else [Common Mistake]",
    rating: 4,
    reason: "Contrarian angle, positions reader as smart, but needs strong authority to pull off.",
    placeholders: ["Common Belief", "Smart People", "Specific Benefit", "Common Mistake"]
  },
  {
    id: 10,
    headline: "Free: The [Valuable Thing] That [Impressive Claim]",
    subHeadline: "No strings attached - just [Specific Benefit] delivered to your [Delivery Method] instantly",
    rating: 4,
    reason: "\"Free\" is powerful, but needs perceived value and clear benefit to convert.",
    placeholders: ["Valuable Thing", "Impressive Claim", "Specific Benefit", "Delivery Method"]
  },
  {
    id: 11,
    headline: "[Testimonial Quote About Amazing Result]",
    subHeadline: "Discover how [Customer] achieved [Specific Result] and how you can too",
    rating: 4,
    reason: "Social proof driven, credible, but needs strong testimonial and visual proof.",
    placeholders: ["Testimonial Quote About Amazing Result", "Customer", "Specific Result"]
  },
  {
    id: 12,
    headline: "The Lazy Person's Way To [Desired Outcome]",
    subHeadline: "Get [Result] without [Effort/Time/Skill] - even if you [Common Limitation]",
    rating: 4,
    reason: "Appeals to ease-seeking, but can attract wrong customers if not qualified properly.",
    placeholders: ["Desired Outcome", "Result", "Effort/Time/Skill", "Common Limitation"]
  },
  {
    id: 14,
    headline: "The [Industry] Insider's Guide To [Getting Specific Result]",
    subHeadline: "Industry secrets revealed: [Specific Tactic] that [Impressive Statistic]",
    rating: 4,
    reason: "Authority positioning, insider knowledge appeal, needs credible industry connection.",
    placeholders: ["Industry", "Getting Specific Result", "Specific Tactic", "Impressive Statistic"]
  },
  {
    id: 16,
    headline: "The [Negative Event] That Led To [Positive Discovery]",
    subHeadline: "How my biggest [Failure/Challenge] revealed the secret to [Desired Outcome]",
    rating: 4,
    reason: "Storytelling, vulnerability builds trust, but needs compelling narrative.",
    placeholders: ["Negative Event", "Positive Discovery", "Failure/Challenge", "Desired Outcome"]
  },
  {
    id: 17,
    headline: "Before You [Common Action], Read This",
    subHeadline: "Critical information that could [Avoid Problem/Increase Success] in your [Endeavor]",
    rating: 4,
    reason: "Creates pause, positions as essential reading, good for awareness stage.",
    placeholders: ["Common Action", "Avoid Problem/Increase Success", "Endeavor"]
  },
  {
    id: 21,
    headline: "Attention [Target Audience]: Your [Current Method] Is Broken",
    subHeadline: "Why [Popular Approach] fails [Percentage]% of the time and what works instead",
    rating: 4,
    reason: "Direct address, challenges status quo, but needs authority to make bold claims.",
    placeholders: ["Target Audience", "Current Method", "Popular Approach", "Percentage"]
  },
  {
    id: 22,
    headline: "The [Amount] Question That [Result]",
    subHeadline: "One simple question that [Specific Benefit] - ask it yourself and see what happens",
    rating: 4,
    reason: "Simplicity appeal, interactive element, but needs powerful question for credibility.",
    placeholders: ["Amount", "Result", "Specific Benefit"]
  },
  {
    id: 23,
    headline: "Stop [Unwanted Behavior] and Start [Desired Behavior] in [Time Frame]",
    subHeadline: "The simple swap that [Specific Benefit] without [Common Sacrifice]",
    rating: 4,
    reason: "Clear before/after, actionable, but needs unique angle to stand out.",
    placeholders: ["Unwanted Behavior", "Desired Behavior", "Time Frame", "Specific Benefit", "Common Sacrifice"]
  },
  {
    id: 24,
    headline: "The [Competitor/Alternative] Alternative That [Superior Benefit]",
    subHeadline: "Why smart [Target Audience] are switching to [Your Solution] for [Specific Reason]",
    rating: 4,
    reason: "Competitive positioning, but requires careful legal and ethical consideration.",
    placeholders: ["Competitor/Alternative", "Superior Benefit", "Target Audience", "Your Solution", "Specific Reason"]
  },
  {
    id: 26,
    headline: "Who Else Wants to [Desired Result] in [Timeframe]?",
    subHeadline: "Join [Number] of people who are already using this to [Benefit].",
    rating: 4,
    reason: "Inclusive curiosity + social proof.",
    placeholders: ["Desired Result", "Timeframe", "Number", "Benefit"]
  },
  {
    id: 30,
    headline: "[Number] Little-Known Secrets Every [Audience] Must Know About [Topic]",
    subHeadline: "These insider tips can save you [Money/Time] and make you [Benefit].",
    rating: 4,
    reason: "Specificity + curiosity. Strong for lists.",
    placeholders: ["Number", "Audience", "Topic", "Money/Time", "Benefit"]
  },
  {
    id: 31,
    headline: "How I [Achieved Big Result] Without [Common Obstacle]—And How You Can Too",
    subHeadline: "My story proves you don't need [Barrier] to succeed with [Solution].",
    rating: 4,
    reason: "Storytelling + credibility.",
    placeholders: ["Achieved Big Result", "Common Obstacle", "Barrier", "Solution"]
  },
  {
    id: 34,
    headline: "Discover the [Adjective] New Way to [Desired Result] in [Timeframe]",
    subHeadline: "This isn't the old, broken way. This is faster, smarter, easier.",
    rating: 4,
    reason: "\"New mechanism\" positioning.",
    placeholders: ["Adjective", "Desired Result", "Timeframe"]
  },
  {
    id: 35,
    headline: "What Every [Audience] Ought to Know About [Topic]",
    subHeadline: "If you miss this, you'll waste [Money/Time] and regret it later.",
    rating: 4,
    reason: "Authoritative \"must-know.\"",
    placeholders: ["Audience", "Topic", "Money/Time"]
  },
  {
    id: 36,
    headline: "They Laughed When I [Tried to Achieve Result]… But Then I [Big Win]",
    subHeadline: "Now they ask me how I did it—and I'll show you too.",
    rating: 4,
    reason: "Classic storytelling formula.",
    placeholders: ["Tried to Achieve Result", "Big Win"]
  },
  {
    id: 39,
    headline: "The Lazy [Audience]'s Way to [Desired Result]",
    subHeadline: "No hustle. No tech headaches. Just a proven shortcut to [Goal].",
    rating: 4,
    reason: "Humor + curiosity.",
    placeholders: ["Audience", "Desired Result", "Goal"]
  },

  // ⭐⭐⭐ 3-STAR TEMPLATES (3/5 Rating) - Good with Proper Execution ⭐⭐⭐
  {
    id: 15,
    headline: "What [Number] Studies Reveal About [Topic] Will Shock You",
    subHeadline: "Scientific proof that [Counterintuitive Finding] - and what it means for your [Goal]",
    rating: 3,
    reason: "Research-backed, but \"shock\" language can feel clickbaity. Needs real studies.",
    placeholders: ["Number", "Topic", "Counterintuitive Finding", "Goal"]
  },
  {
    id: 20,
    headline: "The [Time Period] That Changed Everything For [Target Audience]",
    subHeadline: "Discover what happened during [Specific Period] and how to [Replicate Success]",
    rating: 3,
    reason: "Story hook, but needs compelling event and clear relevance to reader.",
    placeholders: ["Time Period", "Target Audience", "Specific Period", "Replicate Success"]
  }
];

interface HeadlineTemplateSelectorProps {
  onTemplateSelect: (headline: string, subHeadline: string) => void;
}

export const HeadlineTemplateSelector: React.FC<HeadlineTemplateSelectorProps> = ({
  onTemplateSelect
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<HeadlineTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTemplateClick = (template: HeadlineTemplate) => {
    setSelectedTemplate(template);
    setPlaceholderValues({});
    setIsDialogOpen(true);
  };

  const replacePlaceholders = (text: string, values: Record<string, string>) => {
    let result = text;
    Object.entries(values).forEach(([placeholder, value]) => {
      if (value.trim()) {
        result = result.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), value);
      }
    });
    return result;
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    const customizedHeadline = replacePlaceholders(selectedTemplate.headline, placeholderValues);
    const customizedSubHeadline = replacePlaceholders(selectedTemplate.subHeadline, placeholderValues);

    onTemplateSelect(customizedHeadline, customizedSubHeadline);
    setIsDialogOpen(false);
    setSelectedTemplate(null);
    setPlaceholderValues({});
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="mb-2">
            <Lightbulb className="w-4 h-4 mr-2" />
            Use Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Headline Template</DialogTitle>
            <DialogDescription>
              Select a proven template and customize it for your landing page
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleTemplateClick(template)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Template #{template.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.rating >= 5 ? "default" : "secondary"} className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {template.rating}/5
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Headline:</Label>
                      <p className="font-medium">{template.headline}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Sub-headline:</Label>
                      <p className="text-sm">{template.subHeadline}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Why it works:</Label>
                      <p className="text-sm text-muted-foreground">{template.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Customization Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate && isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setSelectedTemplate(null);
            setPlaceholderValues({});
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customize Template #{selectedTemplate.id}</DialogTitle>
              <DialogDescription>
                Fill in the placeholders to customize your headlines
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Preview:</h4>
                <div className="space-y-2">
                  <p className="font-bold text-lg">{replacePlaceholders(selectedTemplate.headline, placeholderValues)}</p>
                  <p className="text-muted-foreground">{replacePlaceholders(selectedTemplate.subHeadline, placeholderValues)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Customize Placeholders:</h4>
                {selectedTemplate.placeholders.map((placeholder) => (
                  <div key={placeholder}>
                    <Label htmlFor={placeholder} className="text-sm">{placeholder}</Label>
                    {placeholder.includes('Result') || placeholder.includes('Benefit') || placeholder.includes('Solution') ? (
                      <Textarea
                        id={placeholder}
                        value={placeholderValues[placeholder] || ''}
                        onChange={(e) => setPlaceholderValues(prev => ({
                          ...prev,
                          [placeholder]: e.target.value
                        }))}
                        placeholder={`Enter ${placeholder.toLowerCase()}...`}
                        rows={2}
                      />
                    ) : (
                      <Input
                        id={placeholder}
                        value={placeholderValues[placeholder] || ''}
                        onChange={(e) => setPlaceholderValues(prev => ({
                          ...prev,
                          [placeholder]: e.target.value
                        }))}
                        placeholder={`Enter ${placeholder.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleApplyTemplate} className="flex-1">
                  Apply Template
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedTemplate(null);
                  setIsDialogOpen(false);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};