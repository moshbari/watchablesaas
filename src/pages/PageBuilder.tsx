import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCampaignLimits } from '@/hooks/useCampaignLimits';
import { TrialLimitTooltip } from '@/components/TrialLimitTooltip';
import { VideoPlayer } from '@/components/VideoPlayer';
import { validateVideoUrl } from '@/lib/videoUtils';
import { HeadlineTemplateSelector } from '@/components/HeadlineTemplateSelector';
import { TimedButton } from '@/components/TimedButton';
import { Plus, Eye, Edit, Trash2, ExternalLink, ArrowRight, Clipboard } from 'lucide-react';

interface Page {
  id: string;
  slug: string;
  title: string;
  headline: string;
  sub_headline?: string;
  video_url?: string;
  video_type: string;
  button_text?: string;
  button_url?: string;
  button_delay: number;
  button_enabled: boolean;
  is_published: boolean;
  headline_font_size: number;
  sub_headline_font_size: number;
  button_bg_color: string;
  button_text_color: string;
  lead_optin_enabled?: boolean;
  lead_optin_mandatory?: boolean;
  lead_optin_name_enabled?: boolean;
  lead_optin_name_required?: boolean;
  lead_optin_email_enabled?: boolean;
  lead_optin_email_required?: boolean;
  lead_optin_phone_enabled?: boolean;
  lead_optin_phone_required?: boolean;
  lead_optin_button_text?: string;
  lead_optin_button_bg_color?: string;
  lead_optin_button_text_color?: string;
  lead_optin_headline?: string;
  lead_optin_description?: string;
  footer_enabled?: boolean;
  copyright_text?: string;
  privacy_policy_url?: string;
  terms_conditions_url?: string;
  earnings_disclaimer_url?: string;
  legal_disclaimer_text?: string;
  earnings_disclaimer_text?: string;
  start_time?: number;
  end_time?: number;
  fake_progress_enabled?: boolean;
  fake_progress_color?: string;
  fake_progress_thickness?: number;
  mobile_fullscreen_enabled?: boolean;
  created_at: string;
}

const PageBuilder = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  
  // Generate default slug with Dubai date and time
  const generateDefaultSlug = () => {
    const now = new Date();
    
    // Get Dubai date/time components
    const dubaiFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dubai',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const parts = dubaiFormatter.formatToParts(now);
    const dateObj: Record<string, string> = {};
    parts.forEach(part => {
      if (part.type !== 'literal') {
        dateObj[part.type] = part.value;
      }
    });
    
    // Format: letsdothis-4oct25-1037am-randomnumber
    const day = dateObj.day;
    const month = dateObj.month.toLowerCase();
    const year = dateObj.year;
    const hour = dateObj.hour.padStart(2, '0');
    const minute = dateObj.minute;
    const period = dateObj.dayPeriod.toLowerCase();
    const random = Math.floor(Math.random() * 10000);
    
    return `letsdothis-${day}${month}${year}-${hour}${minute}${period}-${random}`;
  };
  
  const [formData, setFormData] = useState({
    slug: generateDefaultSlug(),
    title: "Let's Do This Habibi",
    headline: 'How [Target Audience] [Achieve Desired Result] In [Time Frame] Without [Common Obstacle]',
    sub_headline: 'The proven [Number]-step system that [Specific Benefit] - even if [Common Objection]',
    video_url: '',
    video_type: 'youtube',
    button_text: 'Click Here To Secure Your Spot Now',
    button_url: 'https://ultimateonlinemastery.org/',
    button_delay: 5,
    button_enabled: false,
    is_published: false,
    headline_font_size: 28,
    sub_headline_font_size: 16,
    button_bg_color: '#0084ff',
    button_text_color: '#ffffff',
    lead_optin_enabled: false,
    lead_optin_mandatory: false,
    lead_optin_name_enabled: true,
    lead_optin_name_required: false,
    lead_optin_email_enabled: true,
    lead_optin_email_required: true,
    lead_optin_phone_enabled: false,
    lead_optin_phone_required: false,
    lead_optin_button_text: 'Join to Watch Video',
    lead_optin_button_bg_color: '#0084ff',
    lead_optin_button_text_color: '#ffffff',
    lead_optin_headline: 'Become a Member',
    lead_optin_description: 'Enter your information to watch this exclusive video',
    footer_enabled: true,
    copyright_text: '2025 Mosh Bari - Copyright© 2025. All Rights Reserved.',
    privacy_policy_url: 'https://winarzapps.com/privacy-policy/',
    terms_conditions_url: 'https://winarzapps.com/terms-of-service/',
    earnings_disclaimer_url: 'https://winarzapps.com/earning-disclaimer',
    legal_disclaimer_text: 'This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.',
    earnings_disclaimer_text: '*Earnings and income representations made by Mosh Bari, Mosh Bari\'s agency, and Mosh Bari\'s agency and their advertisers/sponsors (collectively, "Mosh Bari\'s agency") are aspirational statements only of your earnings potential. These results are not typical and results will vary. The results on this page are OUR results and from years of testing. We can in NO way guarantee you will get similar results.',
      start_time: undefined,
      end_time: undefined,
      fake_progress_enabled: true,
      fake_progress_color: '#ef4444',
      fake_progress_thickness: 8,
      mobile_fullscreen_enabled: true
    });
  const [timeInputs, setTimeInputs] = useState({
    startHour: '',
    startMinute: '',
    startSecond: '',
    endHour: '',
    endMinute: '',
    endSecond: ''
  });
  const [buttonDelayInputs, setButtonDelayInputs] = useState({
    hours: '0',
    minutes: '0',
    seconds: '5'
  });
  const [loading, setLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const { toast } = useToast();
  const { canCreatePage } = useCampaignLimits();
  const navigate = useNavigate();

  // Function to generate slug from title
  const generateSlugFromTitle = (title: string): string => {
    if (!title.trim()) return '';
    
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 0) // Remove empty strings
      .slice(0, 3); // Take first 3 words
    
    const randomNumber = Math.floor(Math.random() * 1000000);
    return words.join('-') + '-' + randomNumber;
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Helper functions for time conversion
  const timeToSeconds = (hours: string, minutes: string, seconds: string): number => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    return h * 3600 + m * 60 + s;
  };

  const secondsToTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.slug || !formData.title || !formData.headline) {
        throw new Error('Slug, title, and headline are required');
      }

      // Validate video URL if provided
      if (formData.video_url) {
        const validation = validateVideoUrl(formData.video_url);
        if (!validation.isValid) {
          throw new Error('Invalid video URL');
        }
        setFormData(prev => ({
          ...prev,
          video_type: validation.type === 'youtube' ? 'youtube' : 'direct'
        }));
      }

      // Convert time inputs to seconds
      const { startHour, startMinute, startSecond, endHour, endMinute, endSecond } = timeInputs;
      let startTime: number | undefined;
      let endTime: number | undefined;

      if (startHour || startMinute || startSecond) {
        startTime = timeToSeconds(startHour, startMinute, startSecond);
      }

      if (endHour || endMinute || endSecond) {
        endTime = timeToSeconds(endHour, endMinute, endSecond);
        
        // Validate end time is after start time
        if (startTime && endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
      }

      // Format slug
      const slug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

      // Calculate button delay from separate inputs
      const buttonDelaySeconds = 
        (parseInt(buttonDelayInputs.hours) || 0) * 3600 +
        (parseInt(buttonDelayInputs.minutes) || 0) * 60 +
        (parseInt(buttonDelayInputs.seconds) || 0);

      const pageData = {
        ...formData,
        slug,
        button_delay: buttonDelaySeconds,
        start_time: startTime,
        end_time: endTime,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let result;
      if (editingPage) {
        result = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', editingPage.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('pages')
          .insert([pageData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Page ${editingPage ? 'updated' : 'created'} successfully`,
      });

      setIsCreating(false);
      setEditingPage(null);
      resetForm();
      fetchPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page deleted successfully",
      });

      fetchPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      slug: generateDefaultSlug(),
      title: "Let's Do This Habibi",
      headline: 'How [Target Audience] [Achieve Desired Result] In [Time Frame] Without [Common Obstacle]',
      sub_headline: 'The proven [Number]-step system that [Specific Benefit] - even if [Common Objection]',
      video_url: '',
      video_type: 'youtube',
      button_text: 'Click Here To Secure Your Spot Now',
      button_url: 'https://ultimateonlinemastery.org/',
      button_delay: 5,
      button_enabled: false,
      is_published: false,
      headline_font_size: 28,
      sub_headline_font_size: 16,
      button_bg_color: '#0084ff',
      button_text_color: '#ffffff',
      lead_optin_enabled: false,
      lead_optin_mandatory: false,
      lead_optin_name_enabled: true,
      lead_optin_name_required: false,
      lead_optin_email_enabled: true,
      lead_optin_email_required: true,
      lead_optin_phone_enabled: false,
      lead_optin_phone_required: false,
      lead_optin_button_text: 'Join to Watch Video',
      lead_optin_button_bg_color: '#0084ff',
      lead_optin_button_text_color: '#ffffff',
      lead_optin_headline: 'Become a Member',
      lead_optin_description: 'Enter your information to watch this exclusive video',
      footer_enabled: true,
      copyright_text: '2025 Mosh Bari - Copyright© 2025. All Rights Reserved.',
      privacy_policy_url: 'https://winarzapps.com/privacy-policy/',
      terms_conditions_url: 'https://winarzapps.com/terms-of-service/',
      earnings_disclaimer_url: 'https://winarzapps.com/earning-disclaimer',
      legal_disclaimer_text: 'This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.',
      earnings_disclaimer_text: '*Earnings and income representations made by Mosh Bari, Mosh Bari\'s agency, and Mosh Bari\'s agency and their advertisers/sponsors (collectively, "Mosh Bari\'s agency") are aspirational statements only of your earnings potential. These results are not typical and results will vary. The results on this page are OUR results and from years of testing. We can in NO way guarantee you will get similar results.',
      start_time: undefined,
      end_time: undefined,
      fake_progress_enabled: true,
      fake_progress_color: '#ef4444',
      fake_progress_thickness: 8,
      mobile_fullscreen_enabled: true
    });
    setTimeInputs({
      startHour: '',
      startMinute: '',
      startSecond: '',
      endHour: '',
      endMinute: '',
      endSecond: ''
    });
    setButtonDelayInputs({
      hours: '0',
      minutes: '0',
      seconds: '5'
    });
    setPreviewVideo(null);
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      headline: page.headline,
      sub_headline: page.sub_headline || '',
      video_url: page.video_url || '',
      video_type: page.video_type,
      button_text: page.button_text || 'Click Here To Secure Your Spot Now',
      button_url: page.button_url || 'https://ultimateonlinemastery.org/',
      button_delay: page.button_delay || 5,
      button_enabled: page.button_enabled,
      is_published: page.is_published,
      headline_font_size: page.headline_font_size || 28,
      sub_headline_font_size: page.sub_headline_font_size || 16,
      button_bg_color: page.button_bg_color || '#0084ff',
      button_text_color: page.button_text_color || '#ffffff',
      lead_optin_enabled: page.lead_optin_enabled ?? false,
      lead_optin_mandatory: page.lead_optin_mandatory ?? false,
      lead_optin_name_enabled: page.lead_optin_name_enabled ?? true,
      lead_optin_name_required: page.lead_optin_name_required ?? false,
      lead_optin_email_enabled: page.lead_optin_email_enabled ?? true,
      lead_optin_email_required: page.lead_optin_email_required ?? true,
      lead_optin_phone_enabled: page.lead_optin_phone_enabled ?? false,
      lead_optin_phone_required: page.lead_optin_phone_required ?? false,
      lead_optin_button_text: page.lead_optin_button_text || 'Join to Watch Video',
      lead_optin_button_bg_color: page.lead_optin_button_bg_color || '#0084ff',
      lead_optin_button_text_color: page.lead_optin_button_text_color || '#ffffff',
      lead_optin_headline: page.lead_optin_headline || 'Become a Member',
      lead_optin_description: page.lead_optin_description || 'Enter your information to watch this exclusive video',
      footer_enabled: page.footer_enabled ?? true,
      copyright_text: page.copyright_text || '2025 Mosh Bari - Copyright© 2025. All Rights Reserved.',
      privacy_policy_url: page.privacy_policy_url || 'https://winarzapps.com/privacy-policy/',
      terms_conditions_url: page.terms_conditions_url || 'https://winarzapps.com/terms-of-service/',
      earnings_disclaimer_url: page.earnings_disclaimer_url || 'https://winarzapps.com/earning-disclaimer',
      legal_disclaimer_text: page.legal_disclaimer_text || 'This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.',
      earnings_disclaimer_text: page.earnings_disclaimer_text || '*Earnings and income representations made by Mosh Bari, Mosh Bari\'s agency, and Mosh Bari\'s agency and their advertisers/sponsors (collectively, "Mosh Bari\'s agency") are aspirational statements only of your earnings potential. These results are not typical and results will vary. The results on this page are OUR results and from years of testing. We can in NO way guarantee you will get similar results.',
      start_time: page.start_time,
      end_time: page.end_time,
      fake_progress_enabled: page.fake_progress_enabled ?? true,
      fake_progress_color: page.fake_progress_color || '#ef4444',
      fake_progress_thickness: page.fake_progress_thickness || 4,
      mobile_fullscreen_enabled: page.mobile_fullscreen_enabled ?? true
    });

    // Set time inputs based on existing times
    if (page.start_time) {
      const startTime = secondsToTime(page.start_time);
      setTimeInputs(prev => ({
        ...prev,
        startHour: startTime.hours,
        startMinute: startTime.minutes,
        startSecond: startTime.seconds
      }));
    }
    if (page.end_time) {
      const endTime = secondsToTime(page.end_time);
      setTimeInputs(prev => ({
        ...prev,
        endHour: endTime.hours,
        endMinute: endTime.minutes,
        endSecond: endTime.seconds
      }));
    }

    // Set button delay inputs based on existing button delay
    const buttonDelayTime = secondsToTime(page.button_delay || 5);
    setButtonDelayInputs({
      hours: buttonDelayTime.hours,
      minutes: buttonDelayTime.minutes,
      seconds: buttonDelayTime.seconds
    });

    setPreviewVideo(page.video_url || null);
    setIsCreating(true);
  };

  const handleVideoPreview = () => {
    if (formData.video_url) {
      const validation = validateVideoUrl(formData.video_url);
      if (validation.isValid) {
        setPreviewVideo(formData.video_url);
      } else {
        toast({
          title: "Invalid Video URL",
          description: "Please enter a valid YouTube URL or direct video file URL",
          variant: "destructive",
        });
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setFormData(prev => ({ ...prev, video_url: text }));
        toast({
          title: "Pasted",
          description: "Video URL pasted from clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Please allow clipboard access or paste manually",
        variant: "destructive",
      });
    }
  };

  // Auto-preview video when URL changes
  useEffect(() => {
    if (formData.video_url) {
      const validation = validateVideoUrl(formData.video_url);
      if (validation.isValid) {
        setPreviewVideo(formData.video_url);
      } else {
        setPreviewVideo(null);
      }
    } else {
      setPreviewVideo(null);
    }
  }, [formData.video_url]);

  if (isCreating || editingPage) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{editingPage ? 'Edit Page' : 'Create New Page'}</h1>
            <Button variant="outline" onClick={() => { setIsCreating(false); setEditingPage(null); resetForm(); }}>
              Back to Pages
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Configuration</CardTitle>
                <CardDescription>Configure your landing page settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          title: newTitle,
                          // Auto-generate slug if it's empty or hasn't been manually edited
                          slug: prev.slug === '' || prev.slug === generateSlugFromTitle(prev.title) 
                            ? generateSlugFromTitle(newTitle) 
                            : prev.slug
                        }));
                      }}
                      placeholder="My Landing Page"
                      required
                      className="border-2 border-foreground/80 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="Auto-generated from title..."
                      required
                      className="border-2 border-foreground/80 rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your page will be available at: /{formData.slug || 'auto-generated-slug'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="headline">Headline</Label>
                      <HeadlineTemplateSelector 
                        onTemplateSelect={(headline, subHeadline) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            headline: headline,
                            sub_headline: subHeadline
                          }));
                        }}
                      />
                    </div>
                    <Textarea
                      id="headline"
                      value={formData.headline}
                      onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="Transform Your Business Today"
                      required
                      rows={2}
                      className="border-2 border-foreground/80 rounded-lg"
                    />
                    <div className="mt-3">
                      <Label htmlFor="headline_font_size">Font Size: {formData.headline_font_size}px</Label>
                      <Slider
                        id="headline_font_size"
                        min={24}
                        max={80}
                        step={2}
                        value={[formData.headline_font_size]}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, headline_font_size: value[0] }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sub_headline">Sub-headline (Optional)</Label>
                    <Textarea
                      id="sub_headline"
                      value={formData.sub_headline}
                      onChange={(e) => setFormData(prev => ({ ...prev, sub_headline: e.target.value }))}
                      placeholder="Discover the proven system that's helped thousands..."
                      rows={2}
                      className="border-2 border-foreground/80 rounded-lg"
                    />
                    <div className="mt-3">
                      <Label htmlFor="sub_headline_font_size">Font Size: {formData.sub_headline_font_size}px</Label>
                      <Slider
                        id="sub_headline_font_size"
                        min={14}
                        max={32}
                        step={1}
                        value={[formData.sub_headline_font_size]}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sub_headline_font_size: value[0] }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="video_url">Video URL (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="video_url"
                        value={formData.video_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="border-2 border-foreground/80 rounded-lg"
                      />
                      <Button type="button" variant="outline" onClick={handlePaste}>
                        <Clipboard className="w-4 h-4 mr-2" />
                        Paste
                      </Button>
                    </div>
                  </div>

                  {/* Time Range Controls */}
                  {formData.video_url && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                      <Label className="text-sm font-medium">Time Range (Optional)</Label>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Start Time</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="HH"
                              min="0"
                              max="23"
                              value={timeInputs.startHour}
                              onChange={(e) => setTimeInputs(prev => ({ ...prev, startHour: e.target.value }))}
                              className="w-20 text-center border-2 border-foreground/80 rounded-lg"
                            />
                            <span className="text-muted-foreground font-bold">:</span>
                            <Input
                              type="number"
                              placeholder="MM"
                              min="0"
                              max="59"
                              value={timeInputs.startMinute}
                              onChange={(e) => setTimeInputs(prev => ({ ...prev, startMinute: e.target.value }))}
                              className="w-20 text-center border-2 border-foreground/80 rounded-lg"
                            />
                            <span className="text-muted-foreground font-bold">:</span>
                            <Input
                              type="number"
                              placeholder="SS"
                              min="0"
                              max="59"
                              value={timeInputs.startSecond}
                              onChange={(e) => setTimeInputs(prev => ({ ...prev, startSecond: e.target.value }))}
                              className="w-20 text-center border-2 border-foreground/80 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">End Time</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="HH"
                              min="0"
                              max="23"
                              value={timeInputs.endHour}
                              onChange={(e) => setTimeInputs(prev => ({ ...prev, endHour: e.target.value }))}
                              className="w-20 text-center border-2 border-foreground/80 rounded-lg"
                            />
                            <span className="text-muted-foreground font-bold">:</span>
                            <Input
                              type="number"
                              placeholder="MM"
                              min="0"
                              max="59"
                              value={timeInputs.endMinute}
                              onChange={(e) => setTimeInputs(prev => ({ ...prev, endMinute: e.target.value }))}
                              className="w-20 text-center border-2 border-foreground/80 rounded-lg"
                            />
                            <span className="text-muted-foreground font-bold">:</span>
                            <Input
                              type="number"
                              placeholder="SS"
                              min="0"
                              max="59"
                              value={timeInputs.endSecond}
                              onChange={(e) => setTimeInputs(prev => ({ ...prev, endSecond: e.target.value }))}
                              className="w-20 text-center border-2 border-foreground/80 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Leave empty to play the full video. End time must be after start time.
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Fake Progress Bar Settings */}
                  {formData.video_url && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fake_progress_enabled"
                          checked={formData.fake_progress_enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fake_progress_enabled: checked }))}
                        />
                        <Label htmlFor="fake_progress_enabled">Enable Fake Progress Bar</Label>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Creates a psychological effect of speed by progressing fast initially, then gradually slowing down to match video duration
                      </p>

                      {formData.fake_progress_enabled && (
                        <>
                          <div>
                            <Label htmlFor="fake_progress_color">Progress Bar Color</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                id="fake_progress_color"
                                type="color"
                                value={formData.fake_progress_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, fake_progress_color: e.target.value }))}
                                className="w-16 h-10 p-1 border"
                              />
                              <Input
                                value={formData.fake_progress_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, fake_progress_color: e.target.value }))}
                                placeholder="#ef4444"
                                className="flex-1 border-2 border-foreground/80 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="fake_progress_thickness">Thickness: {formData.fake_progress_thickness}px</Label>
                            <Slider
                              id="fake_progress_thickness"
                              min={2}
                              max={10}
                              step={1}
                              value={[formData.fake_progress_thickness]}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, fake_progress_thickness: value[0] }))}
                              className="mt-2"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Mobile Fullscreen Setting */}
                  {formData.video_url && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mobile_fullscreen_enabled"
                          checked={formData.mobile_fullscreen_enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mobile_fullscreen_enabled: checked }))}
                        />
                        <Label htmlFor="mobile_fullscreen_enabled">Enable Mobile Fullscreen</Label>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Allows fullscreen mode on mobile devices. <strong>Note:</strong> For YouTube videos on iOS Safari, fullscreen is not available due to platform limitations (would expose YouTube links).
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="button_enabled"
                        checked={formData.button_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, button_enabled: checked }))}
                      />
                      <Label htmlFor="button_enabled" className="text-base font-semibold">Enable Call-to-Action Button</Label>
                    </div>

                    {formData.button_enabled && (
                      <>
                        <div>
                          <Label htmlFor="button_text">Button Text</Label>
                          <Input
                            id="button_text"
                            value={formData.button_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                            placeholder="Get Started Now"
                            className="border-2 border-foreground/80 rounded-lg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="button_url">Button URL</Label>
                          <Input
                            id="button_url"
                            value={formData.button_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, button_url: e.target.value }))}
                            placeholder="https://ultimateonlinemastery.org/"
                            type="url"
                            className="border-2 border-foreground/80 rounded-lg"
                          />
                        </div>

                        <div>
                          <Label>Button Delay</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <Label htmlFor="button_delay_hours" className="text-xs text-muted-foreground">Hours</Label>
                            <Input
                              id="button_delay_hours"
                              type="number"
                              min="0"
                              value={buttonDelayInputs.hours}
                              onChange={(e) => setButtonDelayInputs(prev => ({ ...prev, hours: e.target.value }))}
                              placeholder="0"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="button_delay_minutes" className="text-xs text-muted-foreground">Minutes</Label>
                            <Input
                              id="button_delay_minutes"
                              type="number"
                              min="0"
                              max="59"
                              value={buttonDelayInputs.minutes}
                              onChange={(e) => setButtonDelayInputs(prev => ({ ...prev, minutes: e.target.value }))}
                              placeholder="0"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>
                          <div>
                            <Label htmlFor="button_delay_seconds" className="text-xs text-muted-foreground">Seconds</Label>
                            <Input
                              id="button_delay_seconds"
                              type="number"
                              min="0"
                              max="59"
                              value={buttonDelayInputs.seconds}
                              onChange={(e) => setButtonDelayInputs(prev => ({ ...prev, seconds: e.target.value }))}
                              placeholder="0"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Total delay: {(parseInt(buttonDelayInputs.hours) || 0) * 3600 + (parseInt(buttonDelayInputs.minutes) || 0) * 60 + (parseInt(buttonDelayInputs.seconds) || 0)} seconds
                          </p>
                        </div>

                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="button_bg_color">Button Background Color</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                id="button_bg_color"
                                type="color"
                                value={formData.button_bg_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, button_bg_color: e.target.value }))}
                                className="w-16 h-10 p-1 border"
                              />
                              <Input
                                value={formData.button_bg_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, button_bg_color: e.target.value }))}
                                placeholder="#0084ff"
                                className="flex-1 border-2 border-foreground/80 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="button_text_color">Button Text Color</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                id="button_text_color"
                                type="color"
                                value={formData.button_text_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, button_text_color: e.target.value }))}
                                className="w-16 h-10 p-1 border"
                              />
                              <Input
                                value={formData.button_text_color}
                                onChange={(e) => setFormData(prev => ({ ...prev, button_text_color: e.target.value }))}
                                placeholder="#ffffff"
                                className="flex-1 border-2 border-foreground/80 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Timed Button Section */}
                  <TimedButton />

                  <Separator />

                  {/* Lead Optin Section */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lead_optin_enabled"
                        checked={formData.lead_optin_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_enabled: checked }))}
                      />
                      <Label htmlFor="lead_optin_enabled" className="text-base font-semibold">
                        Enable Lead Optin Popup
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When enabled, visitors must submit their information before watching the video
                    </p>

                    {formData.lead_optin_enabled && (
                      <>
                        <div className="pl-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="lead_optin_mandatory"
                              checked={formData.lead_optin_mandatory}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_mandatory: checked }))}
                            />
                            <Label htmlFor="lead_optin_mandatory" className="text-sm font-medium">
                              Make it mandatory
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground pl-8">
                            If enabled, visitors cannot close the popup without submitting their information
                          </p>
                        </div>

                        <div className="pl-8 space-y-4">
                          <div>
                            <Label htmlFor="lead_optin_headline">Popup Headline</Label>
                            <Input
                              id="lead_optin_headline"
                              value={formData.lead_optin_headline}
                              onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_headline: e.target.value }))}
                              placeholder="Become a Member"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>

                          <div>
                            <Label htmlFor="lead_optin_description">Popup Description</Label>
                            <Textarea
                              id="lead_optin_description"
                              value={formData.lead_optin_description}
                              onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_description: e.target.value }))}
                              placeholder="Enter your information to watch this exclusive video"
                              rows={2}
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>

                          <div>
                            <Label htmlFor="lead_optin_button_text">Button Text</Label>
                            <Input
                              id="lead_optin_button_text"
                              value={formData.lead_optin_button_text}
                              onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_button_text: e.target.value }))}
                              placeholder="Join to Watch Video"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="lead_optin_button_bg_color">Button Background Color</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  id="lead_optin_button_bg_color"
                                  type="color"
                                  value={formData.lead_optin_button_bg_color}
                                  onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_button_bg_color: e.target.value }))}
                                  className="w-16 h-10 p-1 border"
                                />
                                <Input
                                  value={formData.lead_optin_button_bg_color}
                                  onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_button_bg_color: e.target.value }))}
                                  placeholder="#0084ff"
                                  className="flex-1 border-2 border-foreground/80 rounded-lg"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="lead_optin_button_text_color">Button Text Color</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  id="lead_optin_button_text_color"
                                  type="color"
                                  value={formData.lead_optin_button_text_color}
                                  onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_button_text_color: e.target.value }))}
                                  className="w-16 h-10 p-1 border"
                                />
                                <Input
                                  value={formData.lead_optin_button_text_color}
                                  onChange={(e) => setFormData(prev => ({ ...prev, lead_optin_button_text_color: e.target.value }))}
                                  placeholder="#ffffff"
                                  className="flex-1 border-2 border-foreground/80 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-base">Form Fields</Label>
                            
                            <div className="space-y-2 pl-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="lead_optin_name_enabled"
                                  checked={formData.lead_optin_name_enabled}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_name_enabled: checked }))}
                                />
                                <Label htmlFor="lead_optin_name_enabled">Name Field</Label>
                              </div>
                              {formData.lead_optin_name_enabled && (
                                <div className="flex items-center space-x-2 pl-8">
                                  <Switch
                                    id="lead_optin_name_required"
                                    checked={formData.lead_optin_name_required}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_name_required: checked }))}
                                  />
                                  <Label htmlFor="lead_optin_name_required" className="text-sm text-muted-foreground">
                                    Make Required
                                  </Label>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 pl-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="lead_optin_email_enabled"
                                  checked={formData.lead_optin_email_enabled}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_email_enabled: checked }))}
                                />
                                <Label htmlFor="lead_optin_email_enabled">Email Field</Label>
                              </div>
                              {formData.lead_optin_email_enabled && (
                                <div className="flex items-center space-x-2 pl-8">
                                  <Switch
                                    id="lead_optin_email_required"
                                    checked={formData.lead_optin_email_required}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_email_required: checked }))}
                                  />
                                  <Label htmlFor="lead_optin_email_required" className="text-sm text-muted-foreground">
                                    Make Required
                                  </Label>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 pl-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="lead_optin_phone_enabled"
                                  checked={formData.lead_optin_phone_enabled}
                                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_phone_enabled: checked }))}
                                />
                                <Label htmlFor="lead_optin_phone_enabled">Phone Field</Label>
                              </div>
                              {formData.lead_optin_phone_enabled && (
                                <div className="flex items-center space-x-2 pl-8">
                                  <Switch
                                    id="lead_optin_phone_required"
                                    checked={formData.lead_optin_phone_required}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lead_optin_phone_required: checked }))}
                                  />
                                  <Label htmlFor="lead_optin_phone_required" className="text-sm text-muted-foreground">
                                    Make Required
                                  </Label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="footer_enabled"
                        checked={formData.footer_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, footer_enabled: checked }))}
                      />
                      <Label htmlFor="footer_enabled" className="text-base font-semibold">Enable Footer & Legal Disclaimers</Label>
                    </div>

                    {formData.footer_enabled && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div>
                          <Label htmlFor="copyright_text">Copyright Text</Label>
                          <Input
                            id="copyright_text"
                            value={formData.copyright_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, copyright_text: e.target.value }))}
                            placeholder="2025 Mosh Bari - Copyright© 2025. All Rights Reserved."
                            className="border-2 border-foreground/80 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                            <Input
                              id="privacy_policy_url"
                              value={formData.privacy_policy_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, privacy_policy_url: e.target.value }))}
                              placeholder="https://winarzapps.com/privacy-policy/"
                              type="url"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>

                          <div>
                            <Label htmlFor="terms_conditions_url">Terms & Conditions URL</Label>
                            <Input
                              id="terms_conditions_url"
                              value={formData.terms_conditions_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, terms_conditions_url: e.target.value }))}
                              placeholder="https://winarzapps.com/terms-of-service/"
                              type="url"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>

                          <div>
                            <Label htmlFor="earnings_disclaimer_url">Earnings Disclaimer URL</Label>
                            <Input
                              id="earnings_disclaimer_url"
                              value={formData.earnings_disclaimer_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, earnings_disclaimer_url: e.target.value }))}
                              placeholder="https://winarzapps.com/earning-disclaimer"
                              type="url"
                              className="border-2 border-foreground/80 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="legal_disclaimer_text">Legal Disclaimer Text</Label>
                          <Textarea
                            id="legal_disclaimer_text"
                            value={formData.legal_disclaimer_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, legal_disclaimer_text: e.target.value }))}
                            placeholder="This site is not a part of the Facebook website..."
                            rows={3}
                            className="border-2 border-foreground/80 rounded-lg"
                          />
                        </div>

                        <div>
                          <Label htmlFor="earnings_disclaimer_text">Earnings Disclaimer Text</Label>
                          <Textarea
                            id="earnings_disclaimer_text"
                            value={formData.earnings_disclaimer_text}
                            onChange={(e) => setFormData(prev => ({ ...prev, earnings_disclaimer_text: e.target.value }))}
                            placeholder="*Earnings and income representations made by..."
                            rows={4}
                            className="border-2 border-foreground/80 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg border">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="is_published" className="text-base font-semibold">Publish Page</Label>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Saving...' : (editingPage ? 'Update Page' : 'Create Page')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Live preview of your landing page</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded-lg border min-h-[400px]">
                    <div className="text-center space-y-4">
                      <h1 
                        className="font-bold text-gray-900"
                        style={{ fontSize: `${formData.headline_font_size}px` }}
                      >
                        {formData.headline || 'Your Headline Here'}
                      </h1>
                      
                      {formData.sub_headline && (
                        <p 
                          className="text-gray-600 max-w-2xl mx-auto"
                          style={{ fontSize: `${formData.sub_headline_font_size}px` }}
                        >
                          {formData.sub_headline}
                        </p>
                      )}

                      {previewVideo && (
                        <div className="max-w-2xl mx-auto my-6">
                          <VideoPlayer 
                            src={previewVideo}
                            onError={() => {}}
                            playButtonColor="#ff0000"
                            playButtonSize={96}
                            fakeProgressEnabled={formData.fake_progress_enabled}
                            fakeProgressColor={formData.fake_progress_color}
                            fakeProgressThickness={formData.fake_progress_thickness}
                          />
                        </div>
                      )}

                      {formData.button_enabled && (
                        <div className="pt-6">
                          <Button 
                            className="px-8 py-3 text-lg flex items-center gap-2"
                            style={{
                              backgroundColor: formData.button_bg_color,
                              color: formData.button_text_color,
                              borderColor: formData.button_bg_color
                            }}
                            disabled
                          >
                            <span>{formData.button_text || 'Get Started Now'}</span>
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            Button appears after {formData.button_delay} seconds
                          </p>
                        </div>
                      )}

                      {formData.footer_enabled && (
                        <div className="pt-8 mt-8 border-t border-gray-200">
                          <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">{formData.copyright_text}</p>
                            <div className="flex justify-center space-x-2 text-sm">
                              <a href={formData.privacy_policy_url} className="text-blue-600 hover:underline">
                                Privacy Policy
                              </a>
                              <span className="text-gray-400">|</span>
                              <a href={formData.terms_conditions_url} className="text-blue-600 hover:underline">
                                Terms & Conditions
                              </a>
                              <span className="text-gray-400">|</span>
                              <a href={formData.earnings_disclaimer_url} className="text-blue-600 hover:underline">
                                Earnings/Income Disclaimer
                              </a>
                            </div>
                            <div className="space-y-3 text-xs text-gray-500 max-w-2xl mx-auto">
                              <p><strong>Legal & Disclaimers:</strong></p>
                              <p>{formData.legal_disclaimer_text}</p>
                              <p>{formData.earnings_disclaimer_text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Page Builder</h1>
          <TrialLimitTooltip disabled={!canCreatePage}>
            <Button 
              onClick={() => setIsCreating(true)} 
              className="flex items-center gap-2"
              disabled={!canCreatePage}
            >
              <Plus className="h-4 w-4" />
              Create New Page
            </Button>
          </TrialLimitTooltip>
        </div>

        <div className="grid gap-6">
          {pages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold mb-2">No pages created yet</h3>
                <p className="text-muted-foreground mb-4">Create your first landing page to get started.</p>
                <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Page
                </Button>
              </CardContent>
            </Card>
          ) : (
            pages.map((page) => (
              <Card key={page.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{page.title}</h3>
                      <div className="flex items-center gap-2">
                        {page.is_published ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{page.headline}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Slug: /{page.slug}</span>
                      <span>•</span>
                      <span>Created: {new Date(page.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {page.is_published && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;