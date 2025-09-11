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
  {
    id: 1,
    headline: "How [Target Audience] [Achieve Desired Result] In [Time Frame] Without [Common Obstacle]",
    subHeadline: "The proven [Number]-step system that [Specific Benefit] - even if [Common Objection]",
    rating: 5,
    reason: "Contains specificity, time constraint, removes friction, addresses objections. Classic conversion formula.",
    placeholders: ["Target Audience", "Achieve Desired Result", "Time Frame", "Common Obstacle", "Number", "Specific Benefit", "Common Objection"]
  },
  {
    id: 2,
    headline: "The [Number] Secrets [Authority Figure] Don't Want You To Know About [Topic]",
    subHeadline: "Discover the insider methods that [Specific Result] used by [Credible Source]",
    rating: 4,
    reason: "Curiosity-driven, authority positioning, but can feel clickbaity without proper execution.",
    placeholders: ["Number", "Authority Figure", "Topic", "Specific Result", "Credible Source"]
  },
  {
    id: 3,
    headline: "WARNING: [Problem] Is Costing You $[Amount] Every [Time Period]",
    subHeadline: "Here's how to stop the bleeding and [Specific Solution] starting [Time Frame]",
    rating: 5,
    reason: "Creates urgency, quantifies problem, positions solution. Strong pain-avoidance trigger.",
    placeholders: ["Problem", "Amount", "Time Period", "Specific Solution", "Time Frame"]
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