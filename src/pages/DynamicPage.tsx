import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoActionButton } from '@/components/VideoActionButton';
import { type OverlayButtonConfig } from '@/components/VideoOverlayButton';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

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
}

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchPage(slug);
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [slug]);

  const fetchPage = async (pageSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', pageSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setPage(data);
      }
    } catch (error: any) {
      console.error('Error fetching page:', error);
      toast({
        title: "Error",
        description: "Failed to load page",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoError = (error: string) => {
    toast({
      title: "Video Error",
      description: error,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/404" replace />;
  }

  // Configure overlay button from page data
  const overlayButtonConfig: OverlayButtonConfig = {
    enabled: page.button_enabled,
    text: page.button_text || 'Get Started Now',
    url: page.button_url || 'https://example.com',
    delay: page.button_delay,
    position: 'center',
    width: '320px',
    height: '60px',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    fontSize: '18px'
  };

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.sub_headline || page.headline} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.sub_headline || page.headline} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.sub_headline || page.headline} />
        <link rel="canonical" href={`${window.location.origin}/${page.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <section className="space-y-6 mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {page.headline}
              </h1>
              
              {page.sub_headline && (
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {page.sub_headline}
                </p>
              )}
            </section>

            {/* Video Section */}
            {page.video_url && (
              <section className="mb-12">
                <div className="max-w-3xl mx-auto">
                  <VideoPlayer 
                    src={page.video_url} 
                    onError={handleVideoError}
                    playButtonColor="#ef4444"
                    playButtonSize={120}
                  />
                </div>
              </section>
            )}

            {/* Call-to-Action Section */}
            {page.button_enabled && (
              <section>
                <VideoActionButton config={overlayButtonConfig} />
              </section>
            )}
          </div>
        </main>

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": page.title,
            "description": page.sub_headline || page.headline,
            "url": `${window.location.origin}/${page.slug}`,
            ...(page.video_url && {
              "video": {
                "@type": "VideoObject",
                "name": page.title,
                "description": page.sub_headline || page.headline,
                "contentUrl": page.video_url
              }
            })
          })}
        </script>
      </div>
    </>
  );
};

export default DynamicPage;