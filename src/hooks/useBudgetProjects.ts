'use client';

import { useQuery } from '@tanstack/react-query';
import type { BudgetProject } from '@/types/finance';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';

export function useBudgetProjects(filters?: { status?: string; year?: number }) {
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['budgetProjects', filters?.status, filters?.year],
    queryFn: async () => {
      try {
        return await financeDataService.getBudgetProjects(filters);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    projects,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
