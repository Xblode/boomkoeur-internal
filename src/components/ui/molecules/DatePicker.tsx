'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/atoms/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms/Popover';
import { Select } from '@/components/ui/atoms/Select';

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date?: Date) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({ date, onSelect, className, placeholder = "Sélectionner une date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
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
          {date ? format(date, "PPP", { locale: fr }) : <span>{placeholder}</span>}
        </button>
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

export function TimePicker({ time, onChange, className }: TimePickerProps) {
  // Generate hours 00-23
  const hours = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' + i : String(i)));
  // Generate minutes 00-59 (step 15 for simplicity in demo, but could be 1 or 5)
  const minutes = Array.from({ length: 4 }, (_, i) => {
    const min = i * 15;
    return min < 10 ? '0' + min : String(min);
  });

  const [selectedHour, setSelectedHour] = React.useState(time?.split(':')[0] || '12');
  const [selectedMinute, setSelectedMinute] = React.useState(time?.split(':')[1] || '00');

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setSelectedHour(newHour);
    onChange?.(`${newHour}:${selectedMinute}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setSelectedMinute(newMinute);
    onChange?.(`${selectedHour}:${newMinute}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Select 
          value={selectedHour} 
          onChange={handleHourChange}
          className="w-[70px] appearance-none"
        >
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
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
          {minutes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
      </div>
      <Clock className="h-4 w-4 text-zinc-500 ml-2" />
    </div>
  );
}
