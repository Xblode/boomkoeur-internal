'use client';

import { useQuery } from '@tanstack/react-query';
import type { FinanceKPIs } from '@/types/finance';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useFinanceKPIs(year?: number) {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;

  const { data: kpis = null, isLoading, error, refetch } = useQuery({
    queryKey: ['financeKPIs', year, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await financeDataService.getFinanceKPIs(year, orgId!);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    kpis: kpis as FinanceKPIs | null,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
