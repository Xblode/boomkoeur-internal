'use client';

import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/lib/supabase/events';
import { getErrorMessage } from '@/lib/utils';

export function useEvents(options?: { enabled?: boolean }) {
  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events'],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      try {
        return await getEvents();
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    events,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
