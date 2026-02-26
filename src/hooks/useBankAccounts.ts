'use client';

import { useQuery } from '@tanstack/react-query';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useBankAccounts() {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;

  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bankAccounts', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await financeDataService.getBankAccounts(orgId!);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    accounts,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
