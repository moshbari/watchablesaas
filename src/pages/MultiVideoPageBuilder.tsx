import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Plus, Trash2, ExternalLink, Edit, Eye } from 'lucide-react';

interface SkipSection {
  fromHour: string; fromMinute: string; fromSecond: string;
  toHour: string; toMinute: string; toSecond: string;
}

interface VideoItem {
  id: string;
  title?: string;
  video_url: string;
  video_type: string;
  startHour: string; startMinute: string; startSecond: string;
  endHour: string; endMinute: string; endSecond: string;
  skipSections: SkipSection[];
}

interface MVPage {
  id: string;
  slug: string;
  title: string;
  headline: string;
  sub_headline?: string | null;
  is_published: boolean;
  columns: number;
  videos: any;
  created_at: string;
}

const timeToSeconds = (h: string, m: string, s: string): number =>
  (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);

const secondsToTime = (sec?: number) => {
  if (!sec || sec <= 0) return { h: '', m: '', s: '' };
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return { h: h ? String(h) : '', m: m ? String(m) : '', s: s ? String(s) : '' };
};

const newVideo = (): VideoItem => ({
  id: crypto.randomUUID(),
  title: '',
  video_url: '',
  video_type: 'youtube',
  startHour: '', startMinute: '', startSecond: '',
  endHour: '', endMinute: '', endSecond: '',
  skipSections: [],
});

const defaultForm = () => ({
  slug: `multivideo-${Math.floor(Math.random() * 1000000)}`,
  title: 'Multi Video Page',
  headline: 'Your Powerful Headline Goes Here',
  sub_headline: 'A short supporting sub-headline that builds on the promise above.',
  headline_font_size: 30,
  headline_color: '#0064c2',
  sub_headline_font_size: 18,
  sub_headline_color: '#4a4a4a',
  text_highlight: '',
  text_highlight_color: '#e73508',
  button_enabled: true,
  button_text: 'Click Here To Get Started',
  button_url: 'https://example.com',
  button_bg_color: '#007bc7',
  button_text_color: '#ffffff',
  button_delay: 0,
  columns: 1,
  is_published: true,
});

const MultiVideoPageBuilder = () => {
  const [pages, setPages] = useState<MVPage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm());
  const [videos, setVideos] = useState<VideoItem[]>([newVideo()]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('multivideo_pages' as any)
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
    setVideos([newVideo()]);
    setIsCreating(true);
  };

  const startEdit = (p: MVPage) => {
    setEditingId(p.id);
    setFormData({
      slug: p.slug,
      title: p.title,
      headline: p.headline,
      sub_headline: p.sub_headline || '',
      headline_font_size: (p as any).headline_font_size ?? 30,
      headline_color: (p as any).headline_color ?? '#0064c2',
      sub_headline_font_size: (p as any).sub_headline_font_size ?? 18,
      sub_headline_color: (p as any).sub_headline_color ?? '#4a4a4a',
      text_highlight: (p as any).text_highlight ?? '',
      text_highlight_color: (p as any).text_highlight_color ?? '#e73508',
      button_enabled: (p as any).button_enabled ?? true,
      button_text: (p as any).button_text ?? 'Click Here',
      button_url: (p as any).button_url ?? '',
      button_bg_color: (p as any).button_bg_color ?? '#007bc7',
      button_text_color: (p as any).button_text_color ?? '#ffffff',
      button_delay: (p as any).button_delay ?? 0,
      columns: p.columns || 1,
      is_published: p.is_published,
    });
    const loadedVideos: VideoItem[] = (Array.isArray(p.videos) ? p.videos : []).map((v: any) => {
      const start = secondsToTime(v.start_time);
      const end = secondsToTime(v.end_time);
      return {
        id: v.id || crypto.randomUUID(),
        title: v.title || '',
        video_url: v.video_url || '',
        video_type: v.video_type || 'youtube',
        startHour: start.h, startMinute: start.m, startSecond: start.s,
        endHour: end.h, endMinute: end.m, endSecond: end.s,
        skipSections: (v.skip_sections || []).map((s: any) => {
          const f = secondsToTime(s.from);
          const t = secondsToTime(s.to);
          return {
            fromHour: f.h, fromMinute: f.m, fromSecond: f.s,
            toHour: t.h, toMinute: t.m, toSecond: t.s,
          };
        }),
      };
    });
    setVideos(loadedVideos.length ? loadedVideos : [newVideo()]);
    setIsCreating(true);
  };

  const updateVideo = (id: string, patch: Partial<VideoItem>) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
  };
  const removeVideo = (id: string) => setVideos(prev => prev.filter(v => v.id !== id));
  const addSkip = (videoId: string) => updateVideo(videoId, {
    skipSections: [
      ...(videos.find(v => v.id === videoId)?.skipSections || []),
      { fromHour: '', fromMinute: '', fromSecond: '', toHour: '', toMinute: '', toSecond: '' },
    ],
  });
  const updateSkip = (videoId: string, idx: number, field: keyof SkipSection, value: string) => {
    const v = videos.find(x => x.id === videoId);
    if (!v) return;
    const next = v.skipSections.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    updateVideo(videoId, { skipSections: next });
  };
  const removeSkip = (videoId: string, idx: number) => {
    const v = videos.find(x => x.id === videoId);
    if (!v) return;
    updateVideo(videoId, { skipSections: v.skipSections.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!formData.slug.trim() || !formData.headline.trim()) {
      toast({ title: 'Missing fields', description: 'Slug and headline are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const videosPayload = videos
        .filter(v => v.video_url.trim())
        .map(v => ({
          id: v.id,
          title: v.title || '',
          video_url: v.video_url,
          video_type: v.video_type,
          start_time: timeToSeconds(v.startHour, v.startMinute, v.startSecond) || null,
          end_time: timeToSeconds(v.endHour, v.endMinute, v.endSecond) || null,
          skip_sections: v.skipSections
            .map(s => ({
              from: timeToSeconds(s.fromHour, s.fromMinute, s.fromSecond),
              to: timeToSeconds(s.toHour, s.toMinute, s.toSecond),
            }))
            .filter(s => s.to > s.from),
        }));

      const payload: any = {
        ...formData,
        sub_headline: formData.sub_headline || null,
        videos: videosPayload,
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase.from('multivideo_pages' as any).update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Saved', description: 'Page updated.' });
      } else {
        const { error } = await supabase.from('multivideo_pages' as any).insert(payload);
        if (error) throw error;
        toast({ title: 'Created', description: 'Page created.' });
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
    const { error } = await supabase.from('multivideo_pages' as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    fetchPages();
  };

  if (!isCreating) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Multi-Video Pages</h1>
            <p className="text-muted-foreground">Build pages with multiple videos in a grid layout.</p>
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
                  <div className="text-sm text-muted-foreground truncate">/mv/{p.slug} • {Array.isArray(p.videos) ? p.videos.length : 0} video(s) • {p.columns} col</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => window.open(`/mv/${p.slug}`, '_blank')}>
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
        <h1 className="text-2xl font-bold">{editingId ? 'Edit' : 'Create'} Multi-Video Page</h1>
        <Button variant="outline" onClick={() => setIsCreating(false)}>Back</Button>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Slug (URL: /mv/...)</Label>
              <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Headline</Label>
            <Textarea rows={2} value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Headline font size (px)</Label>
              <Input type="number" value={formData.headline_font_size} onChange={e => setFormData({ ...formData, headline_font_size: parseInt(e.target.value) || 30 })} />
            </div>
            <div>
              <Label>Headline color</Label>
              <Input type="color" value={formData.headline_color} onChange={e => setFormData({ ...formData, headline_color: e.target.value })} />
            </div>
            <div>
              <Label>Highlight color</Label>
              <Input type="color" value={formData.text_highlight_color} onChange={e => setFormData({ ...formData, text_highlight_color: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Sub-headline</Label>
            <Textarea rows={2} value={formData.sub_headline} onChange={e => setFormData({ ...formData, sub_headline: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Sub-headline font size (px)</Label>
              <Input type="number" value={formData.sub_headline_font_size} onChange={e => setFormData({ ...formData, sub_headline_font_size: parseInt(e.target.value) || 18 })} />
            </div>
            <div>
              <Label>Sub-headline color</Label>
              <Input type="color" value={formData.sub_headline_color} onChange={e => setFormData({ ...formData, sub_headline_color: e.target.value })} />
            </div>
          </div>

          <Separator />

          <div>
            <Label>Video Layout</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map(c => (
                <Button key={c} type="button" variant={formData.columns === c ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, columns: c })}>
                  {c} Column{c > 1 ? 's' : ''}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Call-to-Action Button</Label>
            <Switch checked={formData.button_enabled} onCheckedChange={v => setFormData({ ...formData, button_enabled: v })} />
          </div>
          {formData.button_enabled && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Button text</Label>
                <Input value={formData.button_text} onChange={e => setFormData({ ...formData, button_text: e.target.value })} />
              </div>
              <div>
                <Label>Button URL</Label>
                <Input value={formData.button_url} onChange={e => setFormData({ ...formData, button_url: e.target.value })} />
              </div>
              <div>
                <Label>Background color</Label>
                <Input type="color" value={formData.button_bg_color} onChange={e => setFormData({ ...formData, button_bg_color: e.target.value })} />
              </div>
              <div>
                <Label>Text color</Label>
                <Input type="color" value={formData.button_text_color} onChange={e => setFormData({ ...formData, button_text_color: e.target.value })} />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Published</Label>
              <p className="text-xs text-muted-foreground">Make this page publicly accessible at /mv/{formData.slug}</p>
            </div>
            <Switch checked={formData.is_published} onCheckedChange={v => setFormData({ ...formData, is_published: v })} />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Videos</CardTitle>
          <CardDescription>Add as many videos as you want. They'll be displayed in a {formData.columns}-column grid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {videos.map((v, idx) => (
            <Card key={v.id} className="border-dashed">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Video #{idx + 1}</div>
                  {videos.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeVideo(v.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Title / caption (optional)</Label>
                  <Input value={v.title || ''} onChange={e => updateVideo(v.id, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input value={v.video_url} onChange={e => updateVideo(v.id, { video_url: e.target.value })} placeholder="YouTube / Google Drive / Tella / direct video URL" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Start time</Label>
                    <div className="flex gap-1">
                      <Input placeholder="h" value={v.startHour} onChange={e => updateVideo(v.id, { startHour: e.target.value })} />
                      <Input placeholder="m" value={v.startMinute} onChange={e => updateVideo(v.id, { startMinute: e.target.value })} />
                      <Input placeholder="s" value={v.startSecond} onChange={e => updateVideo(v.id, { startSecond: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">End time</Label>
                    <div className="flex gap-1">
                      <Input placeholder="h" value={v.endHour} onChange={e => updateVideo(v.id, { endHour: e.target.value })} />
                      <Input placeholder="m" value={v.endMinute} onChange={e => updateVideo(v.id, { endMinute: e.target.value })} />
                      <Input placeholder="s" value={v.endSecond} onChange={e => updateVideo(v.id, { endSecond: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs">Skip sections</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addSkip(v.id)}>
                      <Plus className="w-3 h-3 mr-1" />Add skip
                    </Button>
                  </div>
                  {v.skipSections.map((s, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-2 gap-2 mb-2 p-2 bg-muted/40 rounded">
                      <div>
                        <Label className="text-xs">From</Label>
                        <div className="flex gap-1">
                          <Input placeholder="h" value={s.fromHour} onChange={e => updateSkip(v.id, sIdx, 'fromHour', e.target.value)} />
                          <Input placeholder="m" value={s.fromMinute} onChange={e => updateSkip(v.id, sIdx, 'fromMinute', e.target.value)} />
                          <Input placeholder="s" value={s.fromSecond} onChange={e => updateSkip(v.id, sIdx, 'fromSecond', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">To</Label>
                          <Button variant="ghost" size="sm" onClick={() => removeSkip(v.id, sIdx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Input placeholder="h" value={s.toHour} onChange={e => updateSkip(v.id, sIdx, 'toHour', e.target.value)} />
                          <Input placeholder="m" value={s.toMinute} onChange={e => updateSkip(v.id, sIdx, 'toMinute', e.target.value)} />
                          <Input placeholder="s" value={s.toSecond} onChange={e => updateSkip(v.id, sIdx, 'toSecond', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={() => setVideos(prev => [...prev, newVideo()])}>
            <Plus className="w-4 h-4 mr-2" />Add another video
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        {editingId && formData.is_published && (
          <Button variant="outline" onClick={() => window.open(`/mv/${formData.slug}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />View live
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiVideoPageBuilder;
