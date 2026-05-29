import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';

interface SPage {
  title: string;
  html_content: string;
  cta_enabled: boolean;
  cta_text: string;
  cta_url: string;
  cta_bg_color: string;
  cta_text_color: string;
  is_published: boolean;
}

const DynamicStaticPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from('static_pages' as any)
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
      } else {
        setPage(data as any);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Inject HTML and execute any <script> tags it contains.
  useEffect(() => {
    if (!page || !contentRef.current) return;
    const container = contentRef.current;
    container.innerHTML = page.html_content || '';
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
      const s = document.createElement('script');
      Array.from(oldScript.attributes).forEach(a => s.setAttribute(a.name, a.value));
      s.text = oldScript.textContent || '';
      oldScript.parentNode?.replaceChild(s, oldScript);
    });
  }, [page]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (notFound || !page) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Page not found</div>;
  }

  return (
    <>
      <Helmet><title>{page.title}</title></Helmet>
      <div
        ref={contentRef}
        style={{ paddingBottom: page.cta_enabled ? 96 : 0 }}
      />
      {page.cta_enabled && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg"
          style={{ backgroundColor: page.cta_bg_color }}
        >
          <div className="container mx-auto px-4 py-3 flex justify-center">
            <a
              href={page.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 rounded-md font-semibold transition-transform hover:scale-105 w-full max-w-xl text-center"
              style={{
                backgroundColor: page.cta_bg_color,
                color: page.cta_text_color,
                minHeight: 60,
                fontSize: 16,
              }}
            >
              <span>{page.cta_text}</span>
              <span style={{ fontSize: '0.8em' }}>→</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicStaticPage;
