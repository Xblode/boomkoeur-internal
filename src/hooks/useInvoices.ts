'use client';

import { useQuery } from '@tanstack/react-query';
import type { Invoice, InvoiceLine } from '@/types/finance';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getErrorMessage } from '@/lib/utils';

export function useInvoices(
  filters?: { type?: string; status?: string; year?: number },
  options?: { enabled?: boolean }
) {
  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['invoices', filters?.type, filters?.status, filters?.year],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      try {
        return await financeDataService.getInvoices(filters);
      } catch (e) {
        throw e instanceof Error ? e : new Error(getErrorMessage(e));
      }
    },
  });

  return {
    invoices: invoices as (Invoice & { invoice_lines: InvoiceLine[] })[],
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
