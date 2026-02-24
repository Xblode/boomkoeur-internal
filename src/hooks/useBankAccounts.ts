'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BankAccount } from '@/types/finance';
import { getBankAccounts } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBankAccounts();
      setAccounts(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { accounts, isLoading, error, refetch };
}
