"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Meeting } from '@/types/meeting';
import { updateMeeting, getMeetingById } from '@/lib/supabase/meetings';

interface MeetingDetailContextValue {
  meeting: Meeting;
  setMeeting: React.Dispatch<React.SetStateAction<Meeting>>;
  persistField: (updates: Partial<Meeting>) => void;
  reloadMeeting: () => Promise<void>;
}

const MeetingDetailContext = createContext<MeetingDetailContextValue | null>(null);

export function useMeetingDetail() {
  const ctx = useContext(MeetingDetailContext);
  if (!ctx) throw new Error('useMeetingDetail must be used within MeetingDetailProvider');
  return ctx;
}

interface MeetingDetailProviderProps {
  initialMeeting: Meeting;
  children: React.ReactNode;
}

export function MeetingDetailProvider({ initialMeeting, children }: MeetingDetailProviderProps) {
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);

  const persistField = useCallback((updates: Partial<Meeting>) => {
    setMeeting(prev => {
      const updated = { ...prev, ...updates, updated_at: new Date() };
      updateMeeting(prev.id, updates);
      return updated;
    });
  }, []);

  const reloadMeeting = useCallback(async () => {
    const fresh = await getMeetingById(meeting.id);
    if (fresh) setMeeting(fresh);
  }, [meeting.id]);

  const value = useMemo(
    () => ({ meeting, setMeeting, persistField, reloadMeeting }),
    [meeting, persistField, reloadMeeting]
  );

  return (
    <MeetingDetailContext.Provider value={value}>
      {children}
    </MeetingDetailContext.Provider>
  );
}
