"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { Event } from '@/types/event';
import { Campaign } from '@/types/communication';
import { saveEvent, updateEvent, getEventWithMergedArtists } from '@/lib/supabase/events';
import { getCampaigns } from '@/lib/localStorage/communication';
import { useOrg } from '@/components/providers/OrgProvider';

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
  const { activeOrg } = useOrg();
  const [event, setEvent] = useState<Event>(initialEvent);
  const eventRef = useRef(event);
  eventRef.current = event;

  const persistField = useCallback(async (updates: Partial<Event>) => {
    const current = eventRef.current;
    const statusChangedToCompleted = updates.status === 'completed' && current.status !== 'completed';

    if (current.id) {
      const saved = await updateEvent(current.id, updates);
      setEvent(saved);

      // Créer automatiquement une transaction billetterie quand l'event passe à "terminé"
      if (statusChangedToCompleted && saved.shotgunEventId) {
        try {
          const headers: Record<string, string> = {};
          if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
          await fetch(`/api/events/${saved.id}/create-billetterie-transaction`, {
            method: 'POST',
            headers,
          });
        } catch {
          // Silencieux : la transaction peut être créée manuellement
        }
      }
    } else {
      const saved = await saveEvent({ ...current, ...updates });
      setEvent(saved);
    }
  }, [activeOrg?.id]);

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
