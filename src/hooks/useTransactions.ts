'use client';

import { useQuery } from '@tanstack/react-query';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useTransactions(year?: number, options?: { enabled?: boolean }) {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;
  const baseEnabled = options?.enabled ?? true;

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', year, orgId],
    enabled: !!orgId && baseEnabled,
    queryFn: async () => {
      try {
        return await financeDataService.getTransactions(year, orgId!);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    transactions,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
