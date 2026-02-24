'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BudgetProject } from '@/types/finance';
import { getBudgetProjects } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useBudgetProjects(filters?: { status?: string; year?: number }) {
  const [projects, setProjects] = useState<BudgetProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBudgetProjects(filters);
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.year]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { projects, isLoading, error, refetch };
}
