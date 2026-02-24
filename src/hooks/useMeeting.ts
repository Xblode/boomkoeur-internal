'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Meeting } from '@/types/meeting';
import { getMeetingById } from '@/lib/supabase/meetings';

export function useMeeting(meetingId: string | null) {
  const [meeting, setMeeting] = useState<Meeting | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!meetingId) {
      setMeeting(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeetingById(meetingId);
      setMeeting(data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setMeeting(null);
    } finally {
      setIsLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { meeting, isLoading, error, refetch };
}
