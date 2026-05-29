import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ExternalLink, Edit } from 'lucide-react';
import { complementaryColor } from '@/lib/colorUtils';

interface SPage {
  id: string;
  slug: string;
  title: string;
  html_content: string;
  cta_enabled: boolean;
  cta_text: string;
  cta_url: string;
  cta_bg_color: string;
  cta_text_color: string;
  is_published: boolean;
  created_at: string;
  scarcity_enabled: boolean;
  scarcity_type: string;
  scarcity_text: string;
  scarcity_end_at: string | null;
  scarcity_bg_color: string;
  scarcity_text_color: string;
}

const defaultForm = () => ({
  slug: `static-${Math.floor(Math.random() * 1000000)}`,
  title: 'Static Page',
  html_content: '',
  cta_enabled: true,
  cta_text: 'Click Here To Get Started',
  cta_url: 'https://example.com',
  cta_bg_color: '#007bc7',
  cta_text_color: '#ffffff',
  is_published: true,
  scarcity_enabled: false,
  scarcity_type: 'text' as 'text' | 'timer',
  scarcity_text: 'Limited time offer — act now',
  scarcity_end_at: '',
  scarcity_bg_color: '#000000',
  scarcity_text_color: '#ffeb3b',
});

const StaticPageBuilder = () => {
  const [pages, setPages] = useState<SPage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('static_pages' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setPages((data as any) || []);
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData(defaultForm());
    setIsCreating(true);
  };

  const startEdit = (p: SPage) => {
    setEditingId(p.id);
    setFormData({
      slug: p.slug,
      title: p.title,
      html_content: p.html_content || '',
      cta_enabled: p.cta_enabled,
      cta_text: p.cta_text,
      cta_url: p.cta_url,
      cta_bg_color: p.cta_bg_color,
      cta_text_color: p.cta_text_color,
      is_published: p.is_published,
      scarcity_enabled: p.scarcity_enabled ?? false,
      scarcity_type: (p.scarcity_type as 'text' | 'timer') ?? 'text',
      scarcity_text: p.scarcity_text ?? '',
      scarcity_end_at: p.scarcity_end_at ? p.scarcity_end_at.slice(0, 16) : '',
      scarcity_bg_color: p.scarcity_bg_color ?? '#000000',
      scarcity_text_color: p.scarcity_text_color ?? '#ffeb3b',
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.slug.trim()) {
      toast({ title: 'Missing slug', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload: any = {
        ...formData,
        user_id: user.id,
        scarcity_end_at: formData.scarcity_end_at ? new Date(formData.scarcity_end_at).toISOString() : null,
      };

      if (editingId) {
        const { error } = await supabase.from('static_pages' as any).update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Saved', description: 'Page updated.' });
      } else {
        const { error } = await supabase.from('static_pages' as any).insert(payload);
        if (error) throw error;
        toast({ title: 'Created', description: 'Page created.' });
        window.open(`/s/${formData.slug}`, '_blank');
      }
      setIsCreating(false);
      fetchPages();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    const { error } = await supabase.from('static_pages' as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    fetchPages();
  };

  if (!isCreating) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold">Static Pages</h1>
            <p className="text-muted-foreground">Deploy any HTML/JS script as a live page with a sticky CTA bar.</p>
          </div>
          <Button onClick={startCreate}><Plus className="w-4 h-4 mr-2" />New Page</Button>
        </div>

        <div className="grid gap-4">
          {pages.length === 0 && (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No pages yet. Click "New Page" to create one.</CardContent></Card>
          )}
          {pages.map(p => (
            <Card key={p.id}>
              <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.title}</div>
                  <div className="text-sm text-muted-foreground truncate">/s/{p.slug}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => window.open(`/s/${p.slug}`, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-1" />View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                    <Edit className="w-4 h-4 mr-1" />Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{editingId ? 'Edit' : 'Create'} Static Page</h1>
        <Button variant="outline" onClick={() => setIsCreating(false)}>Back</Button>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Slug (URL: /s/...)</Label>
              <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
          </div>

          <Separator />

          <div>
            <Label>HTML / Script</Label>
            <CardDescription className="mb-2">Paste any HTML, JavaScript, or embed script. It will render as the full page body.</CardDescription>
            <Textarea
              rows={16}
              className="font-mono text-xs"
              value={formData.html_content}
              onChange={e => setFormData({ ...formData, html_content: e.target.value })}
              placeholder={'<script src="https://example.com/embed.js"></script>\n<div id="my-widget"></div>'}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Sticky bottom CTA bar</Label>
            <Switch checked={formData.cta_enabled} onCheckedChange={v => setFormData({ ...formData, cta_enabled: v })} />
          </div>
          {formData.cta_enabled && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Button text</Label>
                <Input value={formData.cta_text} onChange={e => setFormData({ ...formData, cta_text: e.target.value })} />
              </div>
              <div>
                <Label>Button URL</Label>
                <Input value={formData.cta_url} onChange={e => setFormData({ ...formData, cta_url: e.target.value })} />
              </div>
              <div>
                <Label>Background color</Label>
                <Input type="color" value={formData.cta_bg_color} onChange={e => setFormData({ ...formData, cta_bg_color: e.target.value })} />
              </div>
              <div>
                <Label>Text color</Label>
                <Input type="color" value={formData.cta_text_color} onChange={e => setFormData({ ...formData, cta_text_color: e.target.value })} />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Scarcity bar (above CTA)</Label>
            <Switch checked={formData.scarcity_enabled} onCheckedChange={v => setFormData({ ...formData, scarcity_enabled: v })} />
          </div>
          {formData.scarcity_enabled && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={formData.scarcity_type === 'text' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, scarcity_type: 'text' })}>Text</Button>
                <Button type="button" size="sm" variant={formData.scarcity_type === 'timer' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, scarcity_type: 'timer' })}>Real countdown (dd:hh:mm:ss)</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>{formData.scarcity_type === 'timer' ? 'Label shown before timer' : 'Scarcity text'}</Label>
                  <Input value={formData.scarcity_text} onChange={e => setFormData({ ...formData, scarcity_text: e.target.value })} placeholder={formData.scarcity_type === 'timer' ? 'Offer ends in' : 'Limited time offer'} />
                </div>
                {formData.scarcity_type === 'timer' && (
                  <div className="md:col-span-2">
                    <Label>Countdown end date/time (your local time)</Label>
                    <Input type="datetime-local" value={formData.scarcity_end_at} onChange={e => setFormData({ ...formData, scarcity_end_at: e.target.value })} />
                    <p className="text-xs text-muted-foreground mt-1">Real timer — when it hits 00:00:00:00 it stays at zero. No fake countdown.</p>
                  </div>
                )}
                <div>
                  <Label>Background color</Label>
                  <Input type="color" value={formData.scarcity_bg_color} onChange={e => setFormData({ ...formData, scarcity_bg_color: e.target.value })} />
                </div>
                <div>
                  <Label>Text color</Label>
                  <Input type="color" value={formData.scarcity_text_color} onChange={e => setFormData({ ...formData, scarcity_text_color: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Published</Label>
              <p className="text-xs text-muted-foreground">Publicly accessible at /s/{formData.slug}</p>
            </div>
            <Switch checked={formData.is_published} onCheckedChange={v => setFormData({ ...formData, is_published: v })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Page')}</Button>
      </div>
    </div>
  );
};

export default StaticPageBuilder;
