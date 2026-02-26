'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommercialContact } from '@/types/commercial';
import { getCommercialContacts } from '@/lib/supabase/commercial';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useCommercialContacts(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;
  const baseEnabled = options?.enabled ?? true;

  const { data: contacts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['commercialContacts', orgId],
    enabled: !!orgId && baseEnabled,
    queryFn: async () => {
      try {
        return await getCommercialContacts(orgId!);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  /** Met à jour un contact localement sans refetch (affichage immédiat) */
  const updateContactInPlace = useCallback(
    (updated: CommercialContact) => {
      queryClient.setQueryData<CommercialContact[]>(['commercialContacts', orgId], (prev) =>
        prev ? prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)) : []
      );
    },
    [queryClient, orgId]
  );

  return {
    contacts,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch: () => refetch(),
    updateContactInPlace,
  };
}
