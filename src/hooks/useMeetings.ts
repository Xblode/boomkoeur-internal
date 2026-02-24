'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Meeting } from '@/types/meeting';
import { getMeetings } from '@/lib/supabase/meetings';
import { getErrorMessage } from '@/lib/utils';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { meetings, isLoading, error, refetch };
}
