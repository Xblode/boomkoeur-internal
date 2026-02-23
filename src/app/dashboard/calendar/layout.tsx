'use client';

import React, { useState, useEffect } from 'react';
import { CalendarLayoutConfig } from '@/components/feature/Backend/Calendar/CalendarLayoutConfig';
import type { Meeting } from '@/types/meeting';

class MeetingServiceHelper {
  private readonly MEETINGS_KEY = 'meetings';

  getMeetings(): Meeting[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.MEETINGS_KEY);
      if (!stored) return [];
      return (JSON.parse(stored) as any[]).map((m: any) => ({
        ...m,
        date: new Date(m.date),
        created_at: new Date(m.created_at),
        updated_at: new Date(m.updated_at),
        minutes: {
          ...m.minutes,
          createdAt: m.minutes.createdAt ? new Date(m.minutes.createdAt) : undefined,
          updatedAt: m.minutes.updatedAt ? new Date(m.minutes.updatedAt) : undefined,
        },
      }));
    } catch {
      return [];
    }
  }
}

const helper = new MeetingServiceHelper();

export default function CalendarLayoutRoute({ children }: { children: React.ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    setMeetings(helper.getMeetings());
  }, []);

  return (
    <CalendarLayoutConfig meetings={meetings}>
      {children}
    </CalendarLayoutConfig>
  );
}
