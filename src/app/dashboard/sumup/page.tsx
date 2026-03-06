'use client';

import { useState, useEffect, useRef } from 'react';
import { useOrg } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Button, Badge } from '@/components/ui/atoms';
import {
  CreditCard,
  Loader2,
  RefreshCw,
  Calendar,
  Euro,
  Package,
  AlertCircle,
  ExternalLink,
  Upload,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SumUpTransaction {
  id: string;
  transaction_code?: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
  payment_type?: string;
  merchant_code?: string;
  card?: { last4?: string; type?: string };
  [key: string]: unknown;
}

interface SumUpReceiptProduct {
  name: string;
  price: number;
  quantity: number;
  total_price: number;
  [key: string]: unknown;
}

interface SumUpReceipt {
  transaction_data?: SumUpTransaction;
  products?: SumUpReceiptProduct[];
  [key: string]: unknown;
}

/** Parse CSV export SumUp (format variable selon le type d'export) */
function parseSumUpCsv(csvText: string): SumUpTransaction[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
  const rows: SumUpTransaction[] = [];
  const col = (name: string[]) =>
    header.findIndex((h) => name.some((n) => h.includes(n) || n.includes(h)));
  const dateIdx = col(['date', 'datum', 'timestamp', 'heure']);
  const amountIdx = col(['montant', 'amount', 'ventes', 'total', 'sum']);
  const codeIdx = col(['code', 'transaction', 'reference', 'id']);
  const statusIdx = col(['statut', 'status', 'state']);
  const currencyIdx = col(['currency', 'devise', 'eur']);

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const amount = amountIdx >= 0 ? parseFloat(String(cells[amountIdx] || '0').replace(',', '.')) : 0;
    if (Number.isNaN(amount)) continue;
    const dateStr = dateIdx >= 0 ? cells[dateIdx] : '';
    const code = codeIdx >= 0 ? cells[codeIdx] : `row-${i}`;
    const status = statusIdx >= 0 ? (cells[statusIdx] || 'SUCCESSFUL') : 'SUCCESSFUL';
    rows.push({
      id: code || `csv-${i}`,
      transaction_code: code,
      amount,
      currency: currencyIdx >= 0 ? cells[currencyIdx] || 'EUR' : 'EUR',
      timestamp: dateStr || new Date().toISOString(),
      status: /fail|cancel|refus/i.test(String(status)) ? 'FAILED' : 'SUCCESSFUL',
    });
  }
  return rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function SumUpPage() {
  const { activeOrg } = useOrg();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transactions, setTransactions] = useState<SumUpTransaction[]>([]);
  const [importedTransactions, setImportedTransactions] = useState<SumUpTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [receipts, setReceipts] = useState<Record<string, SumUpReceipt>>({});
  const [loadingReceipt, setLoadingReceipt] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchStatus = async () => {
    if (!activeOrg?.id) return;
    try {
      const res = await fetch(`/api/admin/integrations?org_id=${activeOrg.id}&provider=sumup`);
      const data = await res.json();
      setConnected(data.connected === true);
    } catch {
      setConnected(false);
    }
  };

  const fetchTransactions = async () => {
    if (!activeOrg?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ org_id: activeOrg.id });
      if (dateRange.start) params.set('start_date', dateRange.start);
      if (dateRange.end) params.set('end_date', dateRange.end);
      params.set('limit', '100');

      const res = await fetch(`/api/admin/integrations/sumup/transactions?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur');
      }
      setTransactions(data.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed = parseSumUpCsv(text);
        setImportedTransactions(parsed);
        setError(null);
        toast.success(`${parsed.length} transaction(s) importée(s)`);
      } catch {
        toast.error('Format CSV non reconnu');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const displayTransactions = importedTransactions.length > 0 ? importedTransactions : transactions;

  const fetchReceipt = async (transactionId: string) => {
    if (!activeOrg?.id || receipts[transactionId]) return;
    setLoadingReceipt(transactionId);
    try {
      const res = await fetch(
        `/api/admin/integrations/sumup/receipts/${transactionId}?org_id=${activeOrg.id}`
      );
      const data = await res.json();
      if (res.ok && data.receipt) {
        setReceipts((prev) => ({ ...prev, [transactionId]: data.receipt }));
      }
    } catch {
      toast.error('Impossible de charger le reçu');
    } finally {
      setLoadingReceipt(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [activeOrg?.id]);

  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const totalAmount = displayTransactions
    .filter((t) => t.status === 'SUCCESSFUL')
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  if (!activeOrg) {
    return (
      <div className="p-6">
        <p className="text-zinc-500">Sélectionnez une organisation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SumUp</h1>
          <p className="text-muted-foreground mt-1">
            Récupération des transactions SumUp (API ou import CSV depuis me.sumup.com)
          </p>
        </div>
        <Link
          href="/dashboard/admin/integration"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground"
        >
          <CreditCard size={16} />
          Configurer SumUp
          <ExternalLink size={14} />
        </Link>
      </div>

      {connected === false && (
        <Card variant="outline" className="border-amber-200 dark:border-amber-900/50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle size={24} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-medium text-foreground">SumUp non connecté</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Connectez votre clé API dans la page Intégrations pour afficher les transactions.
              </p>
            </div>
            <Link
              href="/dashboard/admin/integration"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 h-8 text-xs px-3 py-1 rounded-md border border-border-custom bg-transparent hover:bg-zinc-100 text-foreground dark:hover:bg-zinc-800"
            >
              Configurer
            </Link>
          </CardContent>
        </Card>
      )}

      {connected && (
        <>
          <Card variant="outline" className="border-blue-200 dark:border-blue-900/50">
            <CardContent className="flex items-start gap-3 p-4">
              <Info size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Transactions TPE (terminal physique)</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  L&apos;API SumUp ne permet pas de récupérer les ventes effectuées sur votre terminal physique.
                  Les endpoints documentés concernent uniquement les paiements en ligne (checkouts).
                  Pour importer vos ventes TPE : exportez un CSV depuis{' '}
                  <a
                    href="https://me.sumup.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    me.sumup.com
                  </a>
                  {' '}(Ventes / Transactions) puis importez-le ci-dessous.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={18} />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Début</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Fin</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={fetchTransactions}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="mr-1.5" />
                    Récupérer via API
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleCsvImport}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} className="mr-1.5" />
                Importer CSV
              </Button>
              {importedTransactions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportedTransactions([])}
                  className="text-zinc-500"
                >
                  Effacer l&apos;import
                </Button>
              )}
            </CardContent>
          </Card>

          {displayTransactions.length > 0 && (
            <Card variant="outline">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Euro size={20} className="text-zinc-500" />
                  <span className="font-medium">Total (transactions réussies)</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatAmount(totalAmount, 'EUR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Card variant="outline">
            <CardHeader>
              <CardTitle className="text-base">Transactions</CardTitle>
              <p className="text-sm text-zinc-500">
                {importedTransactions.length > 0
                  ? `${importedTransactions.length} transaction(s) importée(s) depuis CSV`
                  : 'Données API ou import CSV — clic sur une ligne pour charger le reçu (produits)'}
              </p>
            </CardHeader>
            <CardContent>
              {displayTransactions.length === 0 && !loading && (
                <p className="text-zinc-500 py-8 text-center">
                  Cliquez sur &quot;Récupérer via API&quot; ou &quot;Importer CSV&quot; pour charger les données.
                </p>
              )}
              {displayTransactions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="text-left py-2 px-2 font-medium">Date</th>
                        <th className="text-left py-2 px-2 font-medium">Code</th>
                        <th className="text-right py-2 px-2 font-medium">Montant</th>
                        <th className="text-left py-2 px-2 font-medium">Statut</th>
                        <th className="text-left py-2 px-2 font-medium">Paiement</th>
                        <th className="text-left py-2 px-2 font-medium">Reçu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayTransactions.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <td className="py-2 px-2">{formatDate(t.timestamp)}</td>
                          <td className="py-2 px-2 font-mono text-xs">{t.transaction_code ?? t.id?.slice(0, 8)}</td>
                          <td className="py-2 px-2 text-right font-medium">
                            {formatAmount(t.amount ?? 0, t.currency ?? 'EUR')}
                          </td>
                          <td className="py-2 px-2">
                            <Badge
                              variant={
                                t.status === 'SUCCESSFUL'
                                  ? 'success'
                                  : t.status === 'FAILED' || t.status === 'CANCELLED'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {t.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-xs">
                            {t.payment_type ?? '-'}
                            {t.card?.last4 && ` •••• ${t.card.last4}`}
                          </td>
                          <td className="py-2 px-2">
                            {importedTransactions.length > 0 ? (
                              <span className="text-xs text-zinc-400">—</span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => fetchReceipt(t.id)}
                                disabled={!!loadingReceipt}
                              >
                                {loadingReceipt === t.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : receipts[t.id] ? (
                                  <Package size={14} />
                                ) : (
                                  'Voir produits'
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {Object.keys(receipts).length > 0 && (
            <Card variant="outline">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package size={18} />
                  Détail des reçus (produits vendus)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(receipts).map(([txId, receipt]) => (
                  <div
                    key={txId}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 space-y-2"
                  >
                    <p className="text-xs font-mono text-zinc-500">{txId}</p>
                    {receipt.products && receipt.products.length > 0 ? (
                      <ul className="space-y-1">
                        {receipt.products.map((p, i) => (
                          <li key={i} className="flex justify-between text-sm">
                            <span>
                              {p.name} × {p.quantity}
                            </span>
                            <span className="font-medium">
                              {formatAmount(p.total_price ?? p.price * p.quantity, 'EUR')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Pas de détail produits (structure API peut varier)
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
