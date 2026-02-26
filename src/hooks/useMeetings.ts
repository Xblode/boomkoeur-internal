'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetings } from '@/lib/supabase/meetings';
import { getErrorMessage } from '@/lib/utils';

export function useMeetings() {
  const { data: meetings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      try {
        return await getMeetings();
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    meetings,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
