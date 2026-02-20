"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Event } from '@/types/event';
import { Campaign } from '@/types/communication';
import { saveEvent, getEventWithMergedArtists } from '@/lib/localStorage/events';
import { getCampaigns } from '@/lib/localStorage/communication';

interface EventDetailContextValue {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
  persistField: (updates: Partial<Event>) => void;
  reloadEvent: () => void;
  linkedCampaigns: Campaign[];
}

const EventDetailContext = createContext<EventDetailContextValue | null>(null);

export function useEventDetail() {
  const ctx = useContext(EventDetailContext);
  if (!ctx) throw new Error('useEventDetail must be used within EventDetailProvider');
  return ctx;
}

interface EventDetailProviderProps {
  initialEvent: Event;
  children: React.ReactNode;
}

export function EventDetailProvider({ initialEvent, children }: EventDetailProviderProps) {
  const [event, setEvent] = useState<Event>(initialEvent);

  const persistField = useCallback((updates: Partial<Event>) => {
    setEvent(prev => {
      const saved = saveEvent({ ...prev, ...updates });
      return saved;
    });
  }, []);

  const reloadEvent = useCallback(() => {
    const merged = getEventWithMergedArtists(event.id);
    if (merged) setEvent(merged);
  }, [event.id]);

  const linkedCampaigns = useMemo(() => {
    const campaigns = getCampaigns();
    return campaigns.filter((c) => c.eventIds && c.eventIds.includes(event.id));
  }, [event.id]);

  const value = useMemo(
    () => ({ event, setEvent, persistField, reloadEvent, linkedCampaigns }),
    [event, persistField, reloadEvent, linkedCampaigns]
  );

  return (
    <EventDetailContext.Provider value={value}>
      {children}
    </EventDetailContext.Provider>
  );
}
