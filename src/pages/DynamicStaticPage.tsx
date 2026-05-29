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
  cta_bar_bg_color: string;
  auto_complementary: boolean;
  is_published: boolean;
  scarcity_enabled: boolean;
  scarcity_type: string;
  scarcity_text: string;
  scarcity_end_at: string | null;
  scarcity_bg_color: string;
  scarcity_text_color: string;
}

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

const Countdown: React.FC<{ endAt: string }> = ({ endAt }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = new Date(endAt).getTime();
  const diff = Math.max(0, end - now) / 1000;
  const dd = Math.floor(diff / 86400);
  const hh = Math.floor((diff % 86400) / 3600);
  const mm = Math.floor((diff % 3600) / 60);
  const ss = Math.floor(diff % 60);
  return (
    <span className="font-mono tabular-nums tracking-wider font-bold">
      {pad(dd)}:{pad(hh)}:{pad(mm)}:{pad(ss)}
    </span>
  );
};

const DynamicStaticPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

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

  useEffect(() => {
    if (!barRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setBarHeight(e.contentRect.height);
    });
    ro.observe(barRef.current);
    setBarHeight(barRef.current.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [page?.cta_enabled, page?.scarcity_enabled]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (notFound || !page) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Page not found</div>;
  }

  const showBar = page.cta_enabled || page.scarcity_enabled;

  return (
    <>
      <Helmet><title>{page.title}</title></Helmet>
      <div
        ref={contentRef}
        style={{ paddingBottom: showBar ? barHeight + 16 : 0 }}
      />
      {showBar && (
        <div
          ref={barRef}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
          style={{ backgroundColor: page.cta_enabled ? (page.cta_bar_bg_color || '#0a0a0a') : 'transparent' }}
        >
          {page.scarcity_enabled && (
            <div
              className="w-full px-4 py-2 text-center text-sm sm:text-base font-semibold flex items-center justify-center gap-2 flex-wrap"
              style={{ backgroundColor: page.scarcity_bg_color, color: page.scarcity_text_color }}
            >
              {page.scarcity_text && <span>{page.scarcity_text}</span>}
              {page.scarcity_type === 'timer' && page.scarcity_end_at && (
                <Countdown endAt={page.scarcity_end_at} />
              )}
            </div>
          )}
          {page.cta_enabled && (
            <div className="container mx-auto px-5 sm:px-8 py-6 sm:py-8 flex justify-center">
              <a
                href={page.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full max-w-xl rounded-xl font-bold uppercase tracking-wide shadow-lg ring-1 ring-black/20 border-b-4 border-black/30 transition-all hover:scale-[1.02] active:scale-[0.99] active:border-b-2 active:translate-y-[2px]"
                style={{
                  backgroundColor: page.cta_bg_color,
                  color: page.cta_text_color,
                  minHeight: 60,
                  fontSize: 18,
                  textDecoration: 'none',
                }}
              >
                <span>{page.cta_text}</span>
                <span aria-hidden style={{ fontSize: '1.1em' }}>→</span>
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DynamicStaticPage;
