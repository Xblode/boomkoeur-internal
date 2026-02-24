'use client';

import React from 'react';
import { CalendarLayoutConfig } from '@/components/feature/Backend/Calendar/CalendarLayoutConfig';
import { CalendarDataProvider } from '@/components/providers/CalendarDataProvider';

export default function CalendarLayoutRoute({ children }: { children: React.ReactNode }) {
  return (
    <CalendarDataProvider>
      <CalendarLayoutConfig>
        {children}
      </CalendarLayoutConfig>
    </CalendarDataProvider>
  );
}
