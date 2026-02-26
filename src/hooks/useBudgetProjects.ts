'use client';

import { useQuery } from '@tanstack/react-query';
import type { BudgetProject } from '@/types/finance';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useBudgetProjects(filters?: { status?: string; year?: number }) {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['budgetProjects', filters?.status, filters?.year, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      try {
        return await financeDataService.getBudgetProjects(filters, orgId!);
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
