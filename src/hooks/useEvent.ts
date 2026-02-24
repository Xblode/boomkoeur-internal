'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/types/event';
import { getEventWithMergedArtists } from '@/lib/supabase/events';

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEventWithMergedArtists(eventId);
      setEvent(data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { event, isLoading, error, refetch };
}
