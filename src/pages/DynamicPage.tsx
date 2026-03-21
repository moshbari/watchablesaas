import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoActionButton } from '@/components/VideoActionButton';
import { type OverlayButtonConfig } from '@/components/VideoOverlayButton';
import { LeadOptinModal } from '@/components/LeadOptinModal';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { formatText } from '@/lib/textFormatting';

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
  headline_font_size?: number;
  headline_color: string;
  sub_headline_font_size?: number;
  sub_headline_color: string;
  button_bg_color?: string;
  button_text_color?: string;
  text_highlight?: string;
  text_highlight_color?: string;
  text_bold?: string;
  text_italic?: string;
  text_underline?: string;
  user_id?: string;
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
}

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [hasOptedIn, setHasOptedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchPage(slug);
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (page?.id && page.lead_optin_enabled) {
      // Check if user has already opted in for this page
      const optedIn = sessionStorage.getItem(`lead_optin_${page.id}`) === 'true';
      setHasOptedIn(optedIn);
      // Don't show automatically - will show on user tap/click
    }
  }, [page]);

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

  const handlePageClick = () => {
    if (page?.lead_optin_enabled && !hasOptedIn) {
      setShowLeadModal(true);
    }
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
    backgroundColor: page.button_bg_color || '#3b82f6',
    textColor: page.button_text_color || '#ffffff',
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

      <div className="min-h-screen bg-white relative">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <section className="space-y-6 mb-12">
              <h1 
                className="font-bold leading-tight"
                style={{ 
                  fontSize: `${page.headline_font_size || 48}px`,
                  color: page.headline_color || '#000000'
                }}
              >
                {formatText(page.headline, {
                  highlight: page.text_highlight,
                  highlightColor: page.text_highlight_color,
                  bold: page.text_bold,
                  italic: page.text_italic,
                  underline: page.text_underline
                })}
              </h1>
              
              {page.sub_headline && (
                <p 
                  className="max-w-3xl mx-auto leading-relaxed"
                  style={{ 
                    fontSize: `${page.sub_headline_font_size || 20}px`,
                    color: page.sub_headline_color || '#000000'
                  }}
                >
                  {formatText(page.sub_headline, {
                    highlight: page.text_highlight,
                    highlightColor: page.text_highlight_color,
                    bold: page.text_bold,
                    italic: page.text_italic,
                    underline: page.text_underline
                  })}
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
                    startTime={page.start_time}
                    endTime={page.end_time}
                    fakeProgressEnabled={page.fake_progress_enabled ?? true}
                    fakeProgressColor={page.fake_progress_color || '#ef4444'}
                    fakeProgressThickness={page.fake_progress_thickness || 4}
                    mobileFullscreenEnabled={page.mobile_fullscreen_enabled ?? true}
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

            {/* Footer Section */}
            {page.footer_enabled && (
              <footer className="mt-16 pt-8 border-t border-gray-200">
                <div className="text-center space-y-6">
                  <p className="text-sm text-gray-600">
                    {page.copyright_text || '2026 Mosh Bari - Copyright© 2026. All Rights Reserved.'}
                  </p>
                  
                  <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm">
                    <a 
                      href={page.privacy_policy_url || 'https://winarzapps.com/privacy-policy/'} 
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    <span className="text-gray-400 hidden sm:inline">|</span>
                    <a 
                      href={page.terms_conditions_url || 'https://winarzapps.com/terms-of-service/'} 
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms & Conditions
                    </a>
                    <span className="text-gray-400 hidden sm:inline">|</span>
                    <a 
                      href={page.earnings_disclaimer_url || 'https://winarzapps.com/earning-disclaimer'} 
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Earnings/Income Disclaimer
                    </a>
                  </div>

                  <div className="space-y-4 text-xs text-gray-500 max-w-4xl mx-auto">
                    <p className="font-medium">Legal & Disclaimers:</p>
                    <p className="leading-relaxed">
                      {page.legal_disclaimer_text || 'This site is not a part of the Facebook website or Facebook Inc. Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.'}
                    </p>
                    <p className="leading-relaxed">
                      {page.earnings_disclaimer_text || '*Earnings and income representations made by Mosh Bari, Mosh Bari\'s agency, and Mosh Bari\'s agency and their advertisers/sponsors (collectively, "Mosh Bari\'s agency") are aspirational statements only of your earnings potential. These results are not typical and results will vary. The results on this page are OUR results and from years of testing. We can in NO way guarantee you will get similar results.'}
                    </p>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </main>

        {/* Full page overlay when lead optin is required */}
        {page.lead_optin_enabled && !hasOptedIn && (
          <div 
            className="fixed inset-0 bg-black/50 cursor-pointer z-50"
            onClick={handlePageClick}
          />
        )}

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

        {/* Lead Optin Modal */}
        {page.lead_optin_enabled && (
          <LeadOptinModal
            isOpen={showLeadModal}
            onClose={() => {
              setShowLeadModal(false);
              setHasOptedIn(true);
            }}
            pageId={page.id}
            userId={page.user_id || ''}
            nameEnabled={page.lead_optin_name_enabled ?? true}
            nameRequired={page.lead_optin_name_required ?? false}
            emailEnabled={page.lead_optin_email_enabled ?? true}
            emailRequired={page.lead_optin_email_required ?? true}
            phoneEnabled={page.lead_optin_phone_enabled ?? false}
            phoneRequired={page.lead_optin_phone_required ?? false}
            isMandatory={page.lead_optin_mandatory ?? false}
            headline={page.lead_optin_headline}
            description={page.lead_optin_description}
            buttonText={page.lead_optin_button_text}
            buttonBgColor={page.lead_optin_button_bg_color}
            buttonTextColor={page.lead_optin_button_text_color}
          />
        )}
      </div>
    </>
  );
};

export default DynamicPage;