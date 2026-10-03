import React from 'react';
import { Input } from '@/components/ui/input';

interface TimeFieldsProps {
  id?: string;
  /** Total time in seconds. */
  seconds: number;
  onChange: (seconds: number) => void;
}

/** Hours : minutes : seconds boxes for one time value stored as plain seconds. */
export const TimeFields: React.FC<TimeFieldsProps> = ({ id, seconds, onChange }) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const set = (part: 'h' | 'm' | 's', raw: string) => {
    const value = Math.max(0, parseInt(raw) || 0);
    const next = { h, m, s, [part]: part === 'h' ? value : Math.min(value, 59) };
    onChange(next.h * 3600 + next.m * 60 + next.s);
  };

  const box = (part: 'h' | 'm' | 's', value: number, label: string) => (
    <div className="flex items-center gap-1">
      <Input
        id={part === 'h' ? id : undefined}
        type="number"
        min="0"
        max={part === 'h' ? undefined : 59}
        value={value}
        onChange={(e) => set(part, e.target.value)}
        className="w-16 text-center"
        aria-label={label}
      />
      <span className="text-xs text-muted-foreground">{part}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {box('h', h, 'Hours')}
      {box('m', m, 'Minutes')}
      {box('s', s, 'Seconds')}
    </div>
  );
};
