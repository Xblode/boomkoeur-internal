'use client';

import { useQuery } from '@tanstack/react-query';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';

export function useTransactions(year?: number, options?: { enabled?: boolean }) {
  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', year],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      try {
        return await financeDataService.getTransactions(year);
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
