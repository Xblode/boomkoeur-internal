"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { Event } from '@/types/event';
import { Campaign } from '@/types/communication';
import { saveEvent, updateEvent, getEventWithMergedArtists } from '@/lib/supabase/events';
import { getCampaigns } from '@/lib/localStorage/communication';

interface EventDetailContextValue {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
  persistField: (updates: Partial<Event>) => Promise<void>;
  reloadEvent: () => Promise<void>;
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
  const eventRef = useRef(event);
  eventRef.current = event;

  const persistField = useCallback(async (updates: Partial<Event>) => {
    const current = eventRef.current;
    if (current.id) {
      const saved = await updateEvent(current.id, updates);
      setEvent(saved);
    } else {
      const saved = await saveEvent({ ...current, ...updates });
      setEvent(saved);
    }
  }, []);

  const reloadEvent = useCallback(async () => {
    const merged = await getEventWithMergedArtists(eventRef.current.id);
    if (merged) setEvent(merged);
  }, []);

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
