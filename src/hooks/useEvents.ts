'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/types/event';
import { getEvents } from '@/lib/supabase/events';
import { getErrorMessage } from '@/lib/utils';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, isLoading, error, refetch };
}
