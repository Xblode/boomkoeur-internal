'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeetings } from '@/lib/supabase/meetings';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useMeetings(options?: { enabled?: boolean }) {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;

  const { data: meetings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['meetings', orgId],
    enabled: !!orgId && (options?.enabled ?? true),
    queryFn: async () => {
      try {
        return await getMeetings(orgId!);
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
