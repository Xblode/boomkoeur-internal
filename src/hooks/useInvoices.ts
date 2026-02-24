'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice, InvoiceLine } from '@/types/finance';
import { getInvoices } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useInvoices(filters?: { type?: string; status?: string; year?: number }) {
  const [invoices, setInvoices] = useState<(Invoice & { invoice_lines: InvoiceLine[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInvoices(filters);
      setInvoices(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, [filters?.type, filters?.status, filters?.year]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { invoices, isLoading, error, refetch };
}
