"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEventDetail } from './EventDetailProvider';
import { ShotgunTicket } from '@/types/shotgun';
import {
  getShotgunTicketsCache,
  setShotgunTicketsCache,
} from '@/lib/localStorage/shotgun';
import { Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  Loader2,
  Ticket,
  DollarSign,
  ScanLine,
  XCircle,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function centsToEur(cents: number): number {
  return cents / 100;
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(centsToEur(cents));
}

function pct(a: number, b: number): string {
  if (b === 0) return '0%';
  return `${Math.round((a / b) * 100)}%`;
}

interface DailySales {
  date: string;
  label: string;
  tickets: number;
  revenue: number;
}

interface DealBreakdown {
  title: string;
  count: number;
  revenue: number;
}

interface ChannelBreakdown {
  channel: string;
  count: number;
}

interface PaymentBreakdown {
  method: string;
  count: number;
}

interface SourceBreakdown {
  source: string;
  medium: string | null;
  count: number;
}

function computeStats(tickets: ShotgunTicket[]) {
  const valid = tickets.filter((t) => t.ticket_status === 'valid');
  const refunded = tickets.filter((t) => t.ticket_status === 'refunded');
  const canceled = tickets.filter((t) => t.ticket_status === 'canceled');
  const scanned = valid.filter((t) => t.ticket_scanned_at !== null);

  const totalRevenue = valid.reduce((sum, t) => sum + t.deal_price, 0);
  const totalFees = valid.reduce((sum, t) => sum + t.deal_service_fee, 0);

  // Daily sales
  const dailyMap = new Map<string, { tickets: number; revenue: number }>();
  valid.forEach((t) => {
    const day = t.ordered_at.substring(0, 10);
    const entry = dailyMap.get(day) ?? { tickets: 0, revenue: 0 };
    entry.tickets += 1;
    entry.revenue += t.deal_price;
    dailyMap.set(day, entry);
  });
  const dailySales: DailySales[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => {
      let label: string;
      try {
        label = format(new Date(date), 'd MMM', { locale: fr });
      } catch {
        label = date;
      }
      return { date, label, tickets: v.tickets, revenue: v.revenue };
    });

  // Deal breakdown
  const dealMap = new Map<string, DealBreakdown>();
  valid.forEach((t) => {
    const entry = dealMap.get(t.deal_title) ?? { title: t.deal_title, count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += t.deal_price;
    dealMap.set(t.deal_title, entry);
  });
  const dealBreakdown = Array.from(dealMap.values()).sort((a, b) => b.count - a.count);

  // Channel breakdown
  const channelMap = new Map<string, number>();
  valid.forEach((t) => {
    channelMap.set(t.deal_channel, (channelMap.get(t.deal_channel) ?? 0) + 1);
  });
  const channelBreakdown: ChannelBreakdown[] = Array.from(channelMap.entries())
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count);

  // Payment breakdown
  const paymentMap = new Map<string, number>();
  valid.forEach((t) => {
    const m = t.payment_method ?? 'unknown';
    paymentMap.set(m, (paymentMap.get(m) ?? 0) + 1);
  });
  const paymentBreakdown: PaymentBreakdown[] = Array.from(paymentMap.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // Source breakdown
  const sourceMap = new Map<string, SourceBreakdown>();
  valid.forEach((t) => {
    const key = `${t.utm_source ?? 'direct'}|${t.utm_medium ?? ''}`;
    const entry = sourceMap.get(key) ?? {
      source: t.utm_source ?? 'direct',
      medium: t.utm_medium,
      count: 0,
    };
    entry.count += 1;
    sourceMap.set(key, entry);
  });
  const sourceBreakdown = Array.from(sourceMap.values()).sort((a, b) => b.count - a.count);

  return {
    totalTickets: valid.length,
    totalRevenue,
    totalFees,
    scannedCount: scanned.length,
    refundedCount: refunded.length,
    canceledCount: canceled.length,
    dailySales,
    dealBreakdown,
    channelBreakdown,
    paymentBreakdown,
    sourceBreakdown,
  };
}

const CHANNEL_LABELS: Record<string, string> = {
  online: 'En ligne',
  venue: 'Sur place',
  offline: 'Hors ligne',
  invitation: 'Invitation',
  distributor: 'Distributeur',
  duplicata: 'Accompagnant',
  pass_culture: 'Pass Culture',
};

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Carte',
  cash: 'Espèces',
  physical_card: 'Carte physique',
  pix: 'PIX',
  mb_way: 'MB WAY',
  pass_culture: 'Pass Culture',
  bancontact: 'Bancontact',
  installments: 'Paiement échelonné',
  boleto: 'Boleto',
  unknown: 'Non défini',
};

export function EventShotgunStats() {
  const { event } = useEventDetail();
  const [tickets, setTickets] = useState<ShotgunTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchTickets = useCallback(
    async (force = false) => {
      if (!event.shotgunEventId) return;

      if (!force) {
        const cached = getShotgunTicketsCache(event.shotgunEventId);
        if (cached) {
          setTickets(cached);
          setLastSync(new Date());
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          event_id: String(event.shotgunEventId),
          fetch_all: '1',
        });
        const res = await fetch(`/api/shotgun/tickets?${params.toString()}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const json = await res.json();
        const data: ShotgunTicket[] = json.data ?? [];
        setTickets(data);
        setShotgunTicketsCache(event.shotgunEventId!, data);
        setLastSync(new Date());
      } catch {
        setError('Impossible de charger les tickets Shotgun');
      } finally {
        setLoading(false);
      }
    },
    [event.shotgunEventId]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const stats = useMemo(() => computeStats(tickets), [tickets]);

  if (!event.shotgunEventId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 size={40} className="text-zinc-300 dark:text-zinc-600 mb-3" />
        <p className="text-sm text-zinc-500">Aucun event Shotgun lié</p>
      </div>
    );
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-sm text-zinc-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement des statistiques...
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchTickets(true)}>
          <RefreshCw size={14} className="mr-1" /> Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {lastSync && (
            <>Dernière synchro : {format(lastSync, "d MMM 'à' HH:mm", { locale: fr })}</>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTickets(true)}
          disabled={loading}
        >
          <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
          Rafraîchir
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Ticket size={18} />}
          label="Tickets vendus"
          value={String(stats.totalTickets)}
        />
        <KpiCard
          icon={<DollarSign size={18} />}
          label="CA brut"
          value={formatEur(stats.totalRevenue)}
        />
        <KpiCard
          icon={<ScanLine size={18} />}
          label="Taux de scan"
          value={pct(stats.scannedCount, stats.totalTickets)}
          sub={`${stats.scannedCount} scannés`}
        />
        <KpiCard
          icon={<XCircle size={18} />}
          label="Remboursés / Annulés"
          value={`${stats.refundedCount + stats.canceledCount}`}
          sub={`${stats.refundedCount} remb. · ${stats.canceledCount} ann.`}
        />
      </div>

      {/* Sales chart */}
      {stats.dailySales.length >= 1 && (
        <div className="rounded-lg border border-border-custom p-4">
          <h4 className="text-sm font-semibold mb-4">Évolution des ventes</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.dailySales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="shotgunTicketsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.2)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e4e4e7',
                  fontSize: '12px',
                  backgroundColor: '#fff',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((value: number, name: string) => {
                  if (name === 'tickets') return [String(value), 'Tickets vendus'];
                  return [formatEur(value), 'CA'];
                }) as any}
              />
              <Area
                type="monotone"
                dataKey="tickets"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#shotgunTicketsGradient)"
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By deal */}
        <BreakdownTable
          title="Par tarif"
          rows={stats.dealBreakdown.map((d) => ({
            label: d.title,
            value: `${d.count} · ${formatEur(d.revenue)}`,
            count: d.count,
          }))}
          total={stats.totalTickets}
        />

        {/* By channel */}
        <BreakdownTable
          title="Par canal"
          rows={stats.channelBreakdown.map((c) => ({
            label: CHANNEL_LABELS[c.channel] ?? c.channel,
            value: String(c.count),
            count: c.count,
          }))}
          total={stats.totalTickets}
        />

        {/* By payment */}
        <BreakdownTable
          title="Par paiement"
          rows={stats.paymentBreakdown.map((p) => ({
            label: PAYMENT_LABELS[p.method] ?? p.method,
            value: String(p.count),
            count: p.count,
          }))}
          total={stats.totalTickets}
        />

        {/* By source */}
        <BreakdownTable
          title="Par source"
          rows={stats.sourceBreakdown.map((s) => ({
            label: `${s.source}${s.medium ? ` / ${s.medium}` : ''}`,
            value: String(s.count),
            count: s.count,
          }))}
          total={stats.totalTickets}
        />
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border-custom p-4 space-y-1">
      <div className="flex items-center gap-2 text-zinc-500">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; value: string; count: number }[];
  total: number;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-border-custom p-4">
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 dark:text-zinc-300">{row.label}</span>
              <span className="text-zinc-500 tabular-nums">{row.value}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all"
                style={{ width: `${total > 0 ? (row.count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
