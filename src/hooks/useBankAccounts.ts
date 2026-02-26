'use client';

import { useQuery } from '@tanstack/react-query';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';

export function useBankAccounts() {
  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      try {
        return await financeDataService.getBankAccounts();
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
