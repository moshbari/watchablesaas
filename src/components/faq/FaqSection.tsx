import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoContainer } from '@/components/video/VideoContainer';

/** which comes first when an answer has both text and a video */
export type FaqOrder = 'text_first' | 'video_first';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** optional video in the answer: YouTube, Google Drive, Tella or a video file link */
  video_url?: string;
  order?: FaqOrder;
}

export const DEFAULT_FAQ_TITLE = 'Frequently Asked Questions';

/** Only questions with text show on the page; half-filled rows are skipped. */
export const visibleFaqs = (items: unknown): FaqItem[] =>
  (Array.isArray(items) ? items : [])
    .filter((f): f is FaqItem => !!f && typeof f === 'object' && typeof (f as FaqItem).question === 'string')
    .map((f) => ({
      ...f,
      question: f.question.trim(),
      answer: (f.answer || '').trim(),
      video_url: (typeof f.video_url === 'string' ? f.video_url : '').trim(),
      order: f.order === 'video_first' ? 'video_first' : 'text_first',
    }) as FaqItem)
    .filter((f) => f.question.length > 0);

interface FaqSectionProps {
  items: unknown;
  title?: string;
  /** colours follow the page: headline colour for the title, button colour for accents */
  headingColor?: string;
  accentColor?: string;
  /** smaller sizing for the builder's preview */
  compact?: boolean;
}

export const FaqSection = ({
  items,
  title,
  headingColor = '#0f172a',
  accentColor = '#007bc7',
  compact = false,
}: FaqSectionProps) => {
  const faqs = visibleFaqs(items);
  if (faqs.length === 0) return null;

  return (
    <section className={cn('mx-auto w-full max-w-3xl text-left', compact ? 'mt-8' : 'mt-16 sm:mt-20')}>
      <div className={cn('text-center', compact ? 'mb-4' : 'mb-8 sm:mb-10')}>
        <span
          className={cn(
            'inline-block rounded-full px-3 py-1 font-semibold uppercase tracking-[0.18em]',
            compact ? 'text-[10px]' : 'text-xs',
          )}
          style={{ color: accentColor, backgroundColor: /^#[0-9a-f]{6}$/i.test(accentColor) ? `${accentColor}14` : "rgba(0,0,0,0.05)" }}
        >
          FAQ
        </span>
        <h2
          className={cn('mt-3 font-bold leading-tight', compact ? 'text-lg' : 'text-2xl sm:text-3xl')}
          style={{ color: headingColor }}
        >
          {title?.trim() || DEFAULT_FAQ_TITLE}
        </h2>
      </div>

      <AccordionPrimitive.Root type="single" collapsible className={cn(compact ? 'space-y-2' : 'space-y-3')}>
        {faqs.map((faq, i) => (
          <AccordionPrimitive.Item
            key={faq.id || i}
            value={faq.id || String(i)}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md data-[state=open]:shadow-md"
            style={{ ['--faq-accent' as string]: accentColor }}
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  'flex flex-1 items-center gap-4 text-left font-semibold text-gray-900 outline-none transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--faq-accent)] focus-visible:ring-offset-2',
                  compact ? 'px-4 py-3 text-sm' : 'px-5 py-4 text-base sm:px-6 sm:py-5 sm:text-lg',
                )}
              >
                <span className="flex-1">{faq.question}</span>
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-full transition-all duration-300',
                    'bg-gray-100 text-gray-500 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-[var(--faq-accent)] group-data-[state=open]:text-white',
                    compact ? 'h-6 w-6' : 'h-8 w-8',
                  )}
                  aria-hidden
                >
                  <Plus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2.5} />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            {(faq.answer || faq.video_url) && (
              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div
                  className={cn(
                    'flex gap-4',
                    faq.order === 'video_first' ? 'flex-col-reverse' : 'flex-col',
                    compact ? 'mx-4 mb-4 gap-3' : 'mx-5 mb-5 sm:mx-6 sm:mb-6',
                  )}
                >
                  {faq.answer && (
                    <div
                      className={cn(
                        'whitespace-pre-line border-l-[3px] text-gray-600',
                        compact ? 'pl-3 text-xs leading-relaxed' : 'pl-4 text-base leading-relaxed',
                      )}
                      style={{ borderColor: accentColor }}
                    >
                      {faq.answer}
                    </div>
                  )}
                  {faq.video_url && (
                    <div className="overflow-hidden rounded-xl">
                      {/* only mounted while the question is open, so closing it stops the video */}
                      <VideoContainer
                        src={faq.video_url}
                        disableResume
                        fakeProgressEnabled={false}
                        playButtonColor={accentColor}
                        playButtonSize={compact ? 56 : 80}
                      />
                    </div>
                  )}
                </div>
              </AccordionPrimitive.Content>
            )}
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  );
};

/** schema.org FAQPage, so Google can show the questions under the page in search */
export const faqJsonLd = (items: unknown) => {
  const faqs = visibleFaqs(items).filter((f) => f.answer);
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
};
