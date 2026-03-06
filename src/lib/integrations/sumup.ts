/**
 * Client SumUp API
 * https://developer.sumup.com/
 */

import type { SumUpCredentials } from '@/lib/supabase/integrations';

const SUMUP_API_BASE = 'https://api.sumup.com/v0.1';

export interface SumUpTransaction {
  id: string;
  transaction_code?: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: 'SUCCESSFUL' | 'CANCELLED' | 'FAILED' | 'PENDING';
  payment_type?: string;
  merchant_code?: string;
  card?: { last4?: string; type?: string };
  [key: string]: unknown;
}

export interface SumUpTransactionItem {
  name: string;
  price: number;
  quantity: number;
  total_price: number;
  vat_rate?: number;
  [key: string]: unknown;
}

export interface SumUpReceipt {
  transaction_data?: SumUpTransaction;
  products?: SumUpTransactionItem[];
  [key: string]: unknown;
}

export interface SumUpTransactionsResponse {
  items?: SumUpTransaction[];
  data?: SumUpTransaction[];
  next?: string;
  [key: string]: unknown;
}

async function sumUpFetch<T>(
  apiKey: string,
  path: string,
  options?: Record<string, string>
): Promise<T> {
  const url = new URL(`${SUMUP_API_BASE}${path}`);
  if (options) {
    Object.entries(options).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`SumUp API ${res.status}: ${errText || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSumUpTransactions(
  credentials: SumUpCredentials,
  params?: { start_date?: string; end_date?: string; limit?: number }
): Promise<SumUpTransaction[]> {
  const merchantCode = credentials.merchant_code?.trim();

  // Plage par défaut : 30 derniers jours
  const end = params?.end_date || new Date().toISOString().slice(0, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const start = params?.start_date || startDate.toISOString().slice(0, 10);

  const opts: Record<string, string> = {
    startDate: start,
    endDate: end,
    start_date: start,
    end_date: end,
  };
  if (params?.limit) opts.limit = String(params.limit);
  if (merchantCode) opts.merchant_code = merchantCode;

  const query = new URLSearchParams(opts).toString();

  // Essayer plusieurs chemins documentés (l'API SumUp varie selon les produits)
  const pathsToTry: string[] = [];
  if (merchantCode) {
    pathsToTry.push(`/me/transactions/${merchantCode}?${query}`);
    pathsToTry.push(`/merchants/${merchantCode}/transactions?${query}`);
  }
  pathsToTry.push(`/me/transactions?${query}`);

  let lastError: Error | null = null;
  for (const path of pathsToTry) {
    try {
      const data = await sumUpFetch<SumUpTransactionsResponse>(
        credentials.api_key,
        path
      );
      const items = data.items ?? data.data ?? (data as unknown as SumUpTransaction[]);
      return Array.isArray(items) ? items : [];
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (String(lastError.message).includes('404')) continue;
      throw lastError;
    }
  }

  // Fallback : extraire les transactions des checkouts (API Online Payments)
  try {
    const checkoutsData = await sumUpFetch<{ items?: Array<{ transactions?: SumUpTransaction[] }> }>(
      credentials.api_key,
      `/checkouts?${query}`
    );
    const checkouts = checkoutsData.items ?? [];
    const txs = checkouts.flatMap((c) => c.transactions ?? []);
    return txs;
  } catch {
    // ignore
  }

  throw (
    lastError ??
    new Error(
      'SumUp API : endpoint transactions non disponible. Les transactions terminal (carte physique) peuvent ne pas être exposées via l\'API. Vérifiez le scope transactions.history ou contactez le support SumUp.'
    )
  );
}

export async function fetchSumUpReceipt(
  credentials: SumUpCredentials,
  transactionId: string
): Promise<SumUpReceipt | null> {
  try {
    const path = `/me/receipts/${transactionId}`;
    return await sumUpFetch<SumUpReceipt>(credentials.api_key, path);
  } catch {
    return null;
  }
}
