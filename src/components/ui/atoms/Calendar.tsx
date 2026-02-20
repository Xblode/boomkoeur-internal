'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, useDayPicker, type MonthCaptionProps } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { fr } from 'date-fns/locale';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomMonthCaption({ calendarMonth }: MonthCaptionProps) {
  const { nextMonth, previousMonth, goToMonth } = useDayPicker();

  return (
    <div className="flex items-center justify-between pt-1 mb-2 px-1">
      <span className="text-sm font-semibold text-foreground capitalize">
        {format(calendarMonth.date, 'MMMM yyyy', { locale: fr })}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          aria-label="Mois précédent"
          className="h-7 w-7 p-0 flex items-center justify-center rounded-md opacity-50 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          aria-label="Mois suivant"
          className="h-7 w-7 p-0 flex items-center justify-center rounded-md opacity-50 hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:pointer-events-none transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays={showOutsideDays}
      className={cn('p-0', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-2',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex mb-1',
        weekday:
          'text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-zinc-400 select-none text-center',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-zinc-800',
        day_button: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-foreground outline-none'
        ),
        selected:
          'bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white focus:bg-zinc-900 focus:text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-white dark:hover:text-zinc-900 dark:focus:bg-white dark:focus:text-zinc-900 font-medium shadow-sm',
        today:
          'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-semibold',
        outside: 'text-zinc-400 opacity-50 dark:text-zinc-500',
        disabled:
          'text-zinc-300 opacity-50 dark:text-zinc-600 cursor-not-allowed',
        range_middle:
          'aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50 rounded-none',
        hidden: 'invisible',
        nav: 'hidden', // remplacé par CustomMonthCaption
        ...classNames,
      }}
      components={{
        MonthCaption: CustomMonthCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
