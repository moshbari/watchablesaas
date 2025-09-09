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
import { VideoPlayer } from '@/components/VideoPlayer';
import { validateVideoUrl } from '@/lib/videoUtils';
import { Plus, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';

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
  created_at: string;
}

const PageBuilder = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    headline: '',
    sub_headline: '',
    video_url: '',
    video_type: 'youtube',
    button_text: 'Get Started Now',
    button_url: 'https://example.com',
    button_delay: 3,
    button_enabled: false,
    is_published: false,
    headline_font_size: 28,
    sub_headline_font_size: 16,
    button_bg_color: '#0084ff',
    button_text_color: '#ffffff'
  });
  const [loading, setLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

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

      // Format slug
      const slug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

      const pageData = {
        ...formData,
        slug,
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
      slug: '',
      title: '',
      headline: '',
      sub_headline: '',
      video_url: '',
      video_type: 'youtube',
      button_text: 'Get Started Now',
      button_url: 'https://example.com',
      button_delay: 3,
      button_enabled: false,
      is_published: false,
      headline_font_size: 28,
      sub_headline_font_size: 16,
      button_bg_color: '#0084ff',
      button_text_color: '#ffffff'
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
      button_text: page.button_text || 'Get Started Now',
      button_url: page.button_url || 'https://example.com',
      button_delay: page.button_delay,
      button_enabled: page.button_enabled,
      is_published: page.is_published,
      headline_font_size: page.headline_font_size || 28,
      sub_headline_font_size: page.sub_headline_font_size || 16,
      button_bg_color: page.button_bg_color || '#0084ff',
      button_text_color: page.button_text_color || '#ffffff'
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
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="My Landing Page"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="my-landing-page"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your page will be available at: /{formData.slug || 'your-slug'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      value={formData.headline}
                      onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="Transform Your Business Today"
                      required
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
                      />
                      <Button type="button" variant="outline" onClick={handleVideoPreview}>
                        Preview
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="button_enabled"
                        checked={formData.button_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, button_enabled: checked }))}
                      />
                      <Label htmlFor="button_enabled">Enable Call-to-Action Button</Label>
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
                          />
                        </div>

                        <div>
                          <Label htmlFor="button_url">Button URL</Label>
                          <Input
                            id="button_url"
                            value={formData.button_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, button_url: e.target.value }))}
                            placeholder="https://example.com"
                            type="url"
                          />
                        </div>

                        <div>
                          <Label htmlFor="button_delay">Button Delay (seconds)</Label>
                          <Input
                            id="button_delay"
                            type="number"
                            min="0"
                            max="60"
                            value={formData.button_delay}
                            onChange={(e) => setFormData(prev => ({ ...prev, button_delay: parseInt(e.target.value) || 0 }))}
                          />
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
                                className="flex-1"
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
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                    />
                    <Label htmlFor="is_published">Publish Page</Label>
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
                          />
                        </div>
                      )}

                      {formData.button_enabled && (
                        <div className="pt-6">
                          <Button 
                            className="px-8 py-3 text-lg"
                            style={{
                              backgroundColor: formData.button_bg_color,
                              color: formData.button_text_color,
                              borderColor: formData.button_bg_color
                            }}
                            disabled
                          >
                            {formData.button_text || 'Get Started Now'}
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            Button appears after {formData.button_delay} seconds
                          </p>
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
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Page
          </Button>
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