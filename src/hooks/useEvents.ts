'use client';

import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/lib/supabase/events';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useEvents(options?: { enabled?: boolean }) {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;
  const baseEnabled = options?.enabled ?? true;

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events', orgId],
    enabled: !!orgId && baseEnabled,
    queryFn: async () => {
      try {
        return await getEvents(orgId!);
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
