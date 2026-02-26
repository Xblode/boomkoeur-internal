'use client';

import { useQuery } from '@tanstack/react-query';
import type { TransactionCategory } from '@/types/finance';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';

export function useTransactionCategories(type?: 'income' | 'expense') {
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['transactionCategories', type],
    queryFn: async () => {
      try {
        return await financeDataService.getTransactionCategories(type);
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
