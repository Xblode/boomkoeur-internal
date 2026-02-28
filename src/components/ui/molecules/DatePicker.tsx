'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/atoms';
import { Calendar } from '@/components/ui/atoms/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms/Popover';
import { Select } from '@/components/ui/atoms/Select';

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date?: Date) => void;
  className?: string;
  placeholder?: string;
  /** Format d'affichage (ex: "dd/MM/yyyy" pour 24/02/2026). Par défaut: "PPP" (format long) */
  displayFormat?: string;
  /** Variante "text" : texte brut sans icône, bordure ni fond. Idéal pour les tableaux. */
  variant?: 'default' | 'text';
}

export function DatePicker({ date, onSelect, className, placeholder = "Sélectionner une date", displayFormat = "PPP", variant = "default" }: DatePickerProps) {
  const isTextVariant = variant === 'text';

  const triggerContent = date ? format(date, displayFormat, { locale: fr }) : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {isTextVariant ? (
          <button
            type="button"
            className={cn(
              "w-full text-left text-sm font-mono cursor-pointer",
              !date && "text-zinc-500 dark:text-zinc-400",
              "hover:text-zinc-900 dark:hover:text-zinc-100",
              className
            )}
          >
            {triggerContent}
          </button>
        ) : (
          <button
            className={cn(
              "flex h-10 w-full items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm transition-colors",
              "text-left font-normal",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
              !date && "text-zinc-500 dark:text-zinc-400",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {triggerContent}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export interface TimePickerProps {
  time?: string; // Format "HH:mm"
  onChange?: (time: string) => void;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' + i : String(i)));
const MINUTES = Array.from({ length: 4 }, (_, i) => {
  const min = i * 15;
  return min < 10 ? '0' + min : String(min);
});

export function TimePicker({ time, onChange, className }: TimePickerProps) {
  const [h, m] = (time || '00:00').split(':');
  const selectedHour = h && /^\d{2}$/.test(h) ? h : '00';
  const selectedMinute = m && /^\d{2}$/.test(m) ? m : '00';

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(`${e.target.value}:${selectedMinute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(`${selectedHour}:${e.target.value}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Select
          value={selectedHour}
          onChange={handleHourChange}
          className="w-[70px] appearance-none"
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </Select>
      </div>
      <span className="text-zinc-500">:</span>
      <div className="relative">
        <Select
          value={selectedMinute}
          onChange={handleMinuteChange}
          className="w-[70px]"
        >
          {MINUTES.map((min) => (
            <option key={min} value={min}>{min}</option>
          ))}
        </Select>
      </div>
      <Clock className="h-4 w-4 text-zinc-500 ml-2" />
    </div>
  );
}

/** Parse "HH:mm – HH:mm" ou "HH:mm - HH:mm" → [start, end] */
function parseTimeRange(value: string | undefined): [string, string] {
  if (!value?.trim()) return ['20:00', '22:00'];
  const parts = value.split(/[\s–\-]+/).map((p) => p.trim()).filter(Boolean);
  const norm = (s: string) => {
    const [h, m] = s.split(':');
    return h && m && /^\d{1,2}$/.test(h) && /^\d{2}$/.test(m)
      ? `${h.padStart(2, '0')}:${m}`
      : null;
  };
  const start = (parts[0] && norm(parts[0])) || '20:00';
  const end = (parts[1] && norm(parts[1])) || '22:00';
  return [start, end];
}

export interface TimeRangePickerProps {
  value?: string; // "HH:mm – HH:mm"
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimeRangePicker({ value, onChange, className, placeholder = "Choisir l'horaire" }: TimeRangePickerProps) {
  const [start, end] = parseTimeRange(value);
  const [open, setOpen] = React.useState(false);

  const handleStartChange = (t: string) => {
    onChange?.(`${t} – ${end}`);
  };
  const handleEndChange = (t: string) => {
    onChange?.(`${start} – ${t}`);
  };

  const displayValue = value?.trim() ? `${start} – ${end}` : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm transition-colors",
            "text-left font-normal",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300",
            "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
            !displayValue && "text-zinc-500 dark:text-zinc-400",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 shrink-0" />
          {displayValue || placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-zinc-500 shrink-0">Début</span>
            <TimePicker time={start} onChange={handleStartChange} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-zinc-500 shrink-0">Fin</span>
            <TimePicker time={end} onChange={handleEndChange} />
          </div>
          <Button size="sm" variant="primary" className="w-full" onClick={() => setOpen(false)}>
            Valider
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
