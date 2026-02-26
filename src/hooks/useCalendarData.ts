'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CalendarItem } from '@/types/calendar';
import { useEvents } from '@/hooks/useEvents';
import { useMeetings } from '@/hooks/useMeetings';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface UseCalendarDataOptions {
  orgId?: string | null;
  googleCalendarId?: string | null;
  /** Mois affiché pour la plage de requête Google Calendar */
  currentDate?: Date;
}

/**
 * Agrège les données de toutes les sources du calendrier :
 * - Events (via useEvents - cache partagé)
 * - Meetings (via useMeetings - cache partagé)
 * - Posts planifiés des campagnes d'événements
 * - Google Calendar (si org configurée)
 */
export function useCalendarData(options: UseCalendarDataOptions = {}) {
  const { orgId, googleCalendarId, currentDate = new Date() } = options;

  const { events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
  const { meetings, isLoading: meetingsLoading, error: meetingsError, refetch: refetchMeetings } = useMeetings();

  const [googleEvents, setGoogleEvents] = useState<CalendarItem[]>([]);

  const isLoading = eventsLoading || meetingsLoading;
  const error = eventsError || meetingsError;

  const refetch = useCallback(async () => {
    await Promise.all([refetchEvents(), refetchMeetings()]);
  }, [refetchEvents, refetchMeetings]);

  useEffect(() => {
    if (!orgId || !googleCalendarId) {
      setGoogleEvents([]);
      return;
    }

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const timeMin = monthStart.toISOString();
    const timeMax = monthEnd.toISOString();

    const url = new URL('/api/admin/integrations/google/calendar/events', window.location.origin);
    url.searchParams.set('org_id', orgId);
    url.searchParams.set('time_min', timeMin);
    url.searchParams.set('time_max', timeMax);

    fetch(url.toString())
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Erreur ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const items = (data.events ?? []).map((ev: { date: string; time?: string }) => ({
          ...ev,
          date: new Date(ev.date),
        }));
        setGoogleEvents(items);
      })
      .catch(() => setGoogleEvents([]));
  }, [orgId, googleCalendarId, currentDate.getFullYear(), currentDate.getMonth()]);

  const items = useMemo((): CalendarItem[] => {
    const result: CalendarItem[] = [];

    for (const e of events) {
      result.push({
        id: `ev-${e.id}`,
        title: e.name,
        date: new Date(e.date),
        time: format(new Date(e.date), 'HH:mm'),
        location: e.location,
        type: 'event',
        href: `/dashboard/events/${e.id}`,
        source: e,
      });

      const posts = e.comWorkflow?.posts ?? [];
      for (const p of posts) {
        if (p.scheduledDate) {
          const postDate = new Date(p.scheduledDate);
          const postTitle = p.name || p.description || 'Post';
          result.push({
            id: `ev-post-${e.id}-${p.id}`,
            title: `${postTitle} · ${e.name}`,
            date: postDate,
            time: format(postDate, 'HH:mm'),
            type: 'post',
            href: `/dashboard/events/${e.id}`,
            source: { event: e, post: p },
          });
        }
      }
    }

    for (const m of meetings) {
      result.push({
        id: `mt-${m.id}`,
        title: m.title,
        date: new Date(m.date),
        time: m.startTime,
        location: m.location,
        type: 'meeting',
        href: `/dashboard/meetings/${m.id}`,
        source: m,
      });
    }

    for (const g of googleEvents) {
      result.push(g);
    }

    return result;
  }, [events, meetings, googleEvents]);

  return {
    items,
    events,
    meetings,
    isLoading,
    error,
    refetch,
  };
}
