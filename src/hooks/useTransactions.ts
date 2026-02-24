'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types/finance';
import { getTransactions } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useTransactions(year?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactions(year);
      setTransactions(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { transactions, isLoading, error, refetch };
}
