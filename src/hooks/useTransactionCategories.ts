'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TransactionCategory } from '@/types/finance';
import { getTransactionCategories } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useTransactionCategories(type?: 'income' | 'expense') {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactionCategories(type);
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, isLoading, error, refetch };
}
