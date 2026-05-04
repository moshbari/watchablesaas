import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { formatText } from '@/lib/textFormatting';

interface VideoItem {
  id: string;
  title?: string;
  video_url: string;
  video_type: string;
  start_time?: number | null;
  end_time?: number | null;
  skip_sections?: Array<{ from: number; to: number }>;
}

interface MVPage {
  id: string;
  slug: string;
  title: string;
  headline: string;
  sub_headline?: string | null;
  headline_font_size?: number;
  headline_color?: string;
  sub_headline_font_size?: number;
  sub_headline_color?: string;
  text_highlight?: string;
  text_highlight_color?: string;
  button_enabled?: boolean;
  button_text?: string;
  button_url?: string;
  button_bg_color?: string;
  button_text_color?: string;
  columns: number;
  videos: VideoItem[];
  is_published: boolean;
}

const DynamicMultiVideoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<MVPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from('multivideo_pages' as any)
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setPage(data as any);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !page) return <Navigate to="/404" replace />;

  const videos = Array.isArray(page.videos) ? page.videos : [];
  const cols = page.columns || 1;
  const gridClass =
    cols === 3 ? 'grid-cols-1 md:grid-cols-3'
      : cols === 2 ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1';

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.sub_headline || page.headline} />
        <link rel="canonical" href={`${window.location.origin}/mv/${page.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <section className="space-y-6 mb-12">
              <h1
                className="font-bold leading-tight"
                style={{
                  fontSize: `${page.headline_font_size || 30}px`,
                  color: page.headline_color || '#0064c2',
                }}
              >
                {formatText(page.headline, {
                  highlight: page.text_highlight,
                  highlightColor: page.text_highlight_color,
                })}
              </h1>
              {page.sub_headline && (
                <p
                  className="max-w-3xl mx-auto leading-relaxed"
                  style={{
                    fontSize: `${page.sub_headline_font_size || 18}px`,
                    color: page.sub_headline_color || '#4a4a4a',
                  }}
                >
                  {formatText(page.sub_headline, {
                    highlight: page.text_highlight,
                    highlightColor: page.text_highlight_color,
                  })}
                </p>
              )}
            </section>

            {videos.length > 0 && (
              <section className={`grid ${gridClass} gap-6 mb-12`}>
                {videos.map(v => (
                  <div key={v.id} className="space-y-2">
                    {v.title && (
                      <h3 className="text-lg font-semibold text-left text-gray-800">{v.title}</h3>
                    )}
                    <VideoPlayer
                      src={v.video_url}
                      onError={(err) => toast({ title: 'Video Error', description: err, variant: 'destructive' })}
                      playButtonColor="#ef4444"
                      playButtonSize={cols === 1 ? 120 : 80}
                      startTime={v.start_time || undefined}
                      endTime={v.end_time || undefined}
                      skipSections={v.skip_sections || []}
                      fakeProgressEnabled={false}
                      mobileFullscreenEnabled={true}
                      disableResume={true}
                    />
                  </div>
                ))}
              </section>
            )}

            {page.button_enabled && page.button_url && (
              <section className="mb-12">
                <a
                  href={page.button_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105"
                  style={{
                    backgroundColor: page.button_bg_color || '#007bc7',
                    color: page.button_text_color || '#ffffff',
                  }}
                >
                  {page.button_text || 'Get Started'}
                </a>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DynamicMultiVideoPage;
