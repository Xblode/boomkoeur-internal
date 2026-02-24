'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FinanceKPIs } from '@/types/finance';
import { getFinanceKPIs } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useFinanceKPIs(year?: number) {
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFinanceKPIs(year);
      setKpis(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { kpis, isLoading, error, refetch };
}
