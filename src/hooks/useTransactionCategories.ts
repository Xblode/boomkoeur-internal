'use client';

import { useQuery } from '@tanstack/react-query';
import type { TransactionCategory } from '@/types/finance';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useTransactionCategories(type?: 'income' | 'expense') {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;

  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactionCategories', type, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await financeDataService.getTransactionCategories(type, orgId!);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    categories,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
