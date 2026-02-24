'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useOrg } from '@/hooks';
import type { CalendarData } from '@/types/calendar';
import type { Event } from '@/types/event';
import type { Meeting } from '@/types/meeting';

interface CalendarDataContextValue extends CalendarData {
  events: Event[];
  meetings: Meeting[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const CalendarDataContext = createContext<CalendarDataContextValue | null>(null);

export function CalendarDataProvider({ children }: { children: React.ReactNode }) {
  const { activeOrg } = useOrg();
  const [currentDate, setCurrentDateState] = useState<Date>(() => new Date());
  const setCurrentDate = useCallback((date: Date) => setCurrentDateState(date), []);

  const data = useCalendarData({
    orgId: activeOrg?.id ?? null,
    googleCalendarId: activeOrg?.googleCalendarId ?? null,
    currentDate,
  });

  return (
    <CalendarDataContext.Provider
      value={{
        ...data,
        currentDate,
        setCurrentDate,
      }}
    >
      {children}
    </CalendarDataContext.Provider>
  );
}

export function useCalendarDataContext() {
  const ctx = useContext(CalendarDataContext);
  if (!ctx) {
    throw new Error('useCalendarDataContext must be used within CalendarDataProvider');
  }
  return ctx;
}
