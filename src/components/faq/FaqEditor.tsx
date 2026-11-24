import { ArrowDown, ArrowUp, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputWithClipboard } from '@/components/InputWithClipboard';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_FAQ_TITLE, type FaqItem } from './FaqSection';

export const newFaqItem = (): FaqItem => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `faq-${Date.now()}-${Math.random()}`,
  question: '',
  answer: '',
  video_url: '',
  order: 'text_first',
});

interface FaqEditorProps {
  enabled: boolean;
  title: string;
  items: FaqItem[];
  onChange: (next: { faq_enabled?: boolean; faq_title?: string; faqs?: FaqItem[] }) => void;
}

export const FaqEditor = ({ enabled, title, items, onChange }: FaqEditorProps) => {
  const list = Array.isArray(items) ? items : [];

  const update = (id: string, patch: Partial<FaqItem>) =>
    onChange({ faqs: list.map((f) => (f.id === id ? { ...f, ...patch } : f)) });

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    [next[index], next[to]] = [next[to], next[index]];
    onChange({ faqs: next });
  };

  const remove = (id: string) => {
    const next = list.filter((f) => f.id !== id);
    onChange({ faqs: next.length ? next : [newFaqItem()] });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center space-x-2">
        <Switch
          id="faq_enabled"
          checked={enabled}
          onCheckedChange={(checked) =>
            onChange(checked && list.length === 0 ? { faq_enabled: true, faqs: [newFaqItem()] } : { faq_enabled: checked })
          }
        />
        <Label htmlFor="faq_enabled" className="text-base font-semibold">Enable FAQ Section</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Answer the questions people ask before they buy. Shows below the video and button, above the footer.
      </p>

      {enabled && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="faq_title">Section Title</Label>
            <Input
              id="faq_title"
              value={title}
              placeholder={DEFAULT_FAQ_TITLE}
              onChange={(e) => onChange({ faq_title: e.target.value })}
            />
          </div>

          {list.map((faq, i) => (
            <div key={faq.id} className="rounded-xl border bg-background shadow-sm">
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-muted-foreground">
                  {faq.question.trim() || 'New question'}
                </span>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(faq.id)} aria-label="Delete question">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3 p-3">
                <div>
                  <Label htmlFor={`faq-q-${faq.id}`} className="text-sm">Question</Label>
                  <Input
                    id={`faq-q-${faq.id}`}
                    value={faq.question}
                    placeholder="e.g. Do I need any tech skills?"
                    onChange={(e) => update(faq.id, { question: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`faq-a-${faq.id}`} className="text-sm">Answer text <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    id={`faq-a-${faq.id}`}
                    value={faq.answer}
                    rows={3}
                    placeholder="Write a short, clear answer."
                    onChange={(e) => update(faq.id, { answer: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`faq-v-${faq.id}`} className="text-sm">Answer video <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <InputWithClipboard
                    id={`faq-v-${faq.id}`}
                    value={faq.video_url || ''}
                    placeholder="YouTube, Vimeo, Loom, Google Drive, Tella or video file link"
                    onValueChange={(value) => update(faq.id, { video_url: value })}
                  />
                </div>
                {faq.answer.trim() && (faq.video_url || '').trim() && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">What shows first?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        ['text_first', 'Text, then video'],
                        ['video_first', 'Video, then text'],
                      ] as const).map(([value, label]) => {
                        const active = (faq.order || 'text_first') === value;
                        return (
                          <Button
                            key={value}
                            type="button"
                            size="sm"
                            variant={active ? 'default' : 'outline'}
                            className={cn('w-full', active && 'shadow-sm')}
                            onClick={() => update(faq.id, { order: value })}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" className="w-full" onClick={() => onChange({ faqs: [...list, newFaqItem()] })}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" /> Empty questions are skipped, so you can leave spare rows. An answer can be text, a video, or both.
          </p>
        </div>
      )}
    </div>
  );
};
