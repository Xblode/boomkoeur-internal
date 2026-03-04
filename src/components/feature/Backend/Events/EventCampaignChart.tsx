'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import { ShotgunTicket } from '@/types/shotgun';
import type { ComWorkflowPost } from '@/types/event';
import {
  getShotgunTicketsCache,
  setShotgunTicketsCache,
} from '@/lib/localStorage/shotgun';
import { Button } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { CHART_SERIES_COLORS, CHART_UI_COLORS } from '@/lib/constants/chart-colors';
import {
  RefreshCw,
  Loader2,
  Ticket,
  DollarSign,
  BarChart3,
  Image,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatEur(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

interface ChartDataPoint {
  date: string;
  label: string;
  tickets: number;
  revenue: number;
  cumulTickets: number;
  cumulRevenue: number;
  posts: string[];
}

interface PostWithDate {
  post: ComWorkflowPost;
  date: string;
}

function getPostDate(post: ComWorkflowPost): string | null {
  if (post.scheduledDate) {
    const d = post.scheduledDate.substring(0, 10);
    if (d.length === 10) return d;
  }
  return null;
}

function buildChartData(
  tickets: ShotgunTicket[],
  posts: ComWorkflowPost[]
): ChartDataPoint[] {
  const valid = tickets.filter((t) => t.ticket_status === 'valid');

  const dailyMap = new Map<string, { tickets: number; revenue: number }>();
  valid.forEach((t) => {
    const day = t.ordered_at.substring(0, 10);
    const entry = dailyMap.get(day) ?? { tickets: 0, revenue: 0 };
    entry.tickets += 1;
    entry.revenue += t.deal_price;
    dailyMap.set(day, entry);
  });

  const postsWithDates: PostWithDate[] = posts
    .filter((p) => getPostDate(p))
    .map((p) => ({ post: p, date: getPostDate(p)! }));

  const allDates = new Set<string>();
  dailyMap.forEach((_, d) => allDates.add(d));
  postsWithDates.forEach(({ date }) => allDates.add(date));

  const dates = Array.from(allDates).sort();
  if (dates.length === 0) return [];

  const result: ChartDataPoint[] = [];
  let cumulTickets = 0;
  let cumulRevenue = 0;

  for (const date of dates) {
    const day = dailyMap.get(date) ?? { tickets: 0, revenue: 0 };
    cumulTickets += day.tickets;
    cumulRevenue += day.revenue;

    const dayPosts = postsWithDates
      .filter(({ date: d }) => d === date)
      .map(({ post }) => post.name);

    let label: string;
    try {
      label = format(new Date(date), 'd MMM', { locale: fr });
    } catch {
      label = date;
    }

    result.push({
      date,
      label,
      tickets: day.tickets,
      revenue: day.revenue,
      cumulTickets,
      cumulRevenue,
      posts: dayPosts,
    });
  }

  return result;
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
    <Card variant="outline">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-zinc-500">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function EventCampaignChart() {
  const { event } = useEventDetail();
  const { activeOrg } = useOrg();
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
        const headers: Record<string, string> = {};
        if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
        const res = await fetch(`/api/shotgun/tickets?${params.toString()}`, { headers });
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
    [event.shotgunEventId, activeOrg?.id]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const posts = event.comWorkflow?.posts ?? [];
  const chartData = useMemo(() => buildChartData(tickets, posts), [tickets, posts]);

  const validTickets = useMemo(
    () => tickets.filter((t) => t.ticket_status === 'valid'),
    [tickets]
  );
  const totalRevenue = useMemo(
    () => validTickets.reduce((sum, t) => sum + t.deal_price, 0),
    [validTickets]
  );
  const postsPublished = useMemo(
    () => posts.filter((p) => p.ig_media_id).length,
    [posts]
  );
  const campaignStartedAt = event.comWorkflow?.campaign_started_at;
  const ticketsSinceCampaign = useMemo(() => {
    if (!campaignStartedAt) return null;
    const start = campaignStartedAt.substring(0, 10);
    return validTickets.filter((t) => t.ordered_at.substring(0, 10) >= start).length;
  }, [validTickets, campaignStartedAt]);

  const postReferenceDates = useMemo(() => {
    const seen = new Set<string>();
    return posts
      .map((p) => getPostDate(p))
      .filter((d): d is string => d != null && !seen.has(d) && (seen.add(d), true));
  }, [posts]);

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-sm text-zinc-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement du graphique...
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Suivi campagne - Ventes et publications Instagram</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">
            {lastSync && format(lastSync, "d MMM 'à' HH:mm", { locale: fr })}
          </span>
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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Ticket size={18} />}
          label="Tickets vendus"
          value={String(validTickets.length)}
        />
        <KpiCard
          icon={<DollarSign size={18} />}
          label="CA brut"
          value={formatEur(totalRevenue)}
        />
        <KpiCard
          icon={<Image size={18} />}
          label="Posts publiés"
          value={String(postsPublished)}
          sub={`${posts.length} planifiés`}
        />
        <KpiCard
          icon={<BarChart3 size={18} />}
          label="Ventes depuis campagne"
          value={
            ticketsSinceCampaign != null
              ? `${ticketsSinceCampaign}`
              : '—'
          }
          sub={campaignStartedAt ? `Depuis ${format(new Date(campaignStartedAt), 'd MMM', { locale: fr })}` : undefined}
        />
      </div>

      {chartData.length >= 1 ? (
        <Card variant="outline">
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="campaignTicketsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_SERIES_COLORS.balanceChart} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_SERIES_COLORS.balanceChart} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="campaignRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_SERIES_COLORS.revenue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_SERIES_COLORS.revenue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_UI_COLORS.gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v) => `${(v / 100).toFixed(0)}€`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${CHART_UI_COLORS.tooltipBorder}`,
                    fontSize: '12px',
                    backgroundColor: CHART_UI_COLORS.tooltipBg,
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0]?.payload as ChartDataPoint | undefined;
                    if (!point) return null;
                    return (
                      <div className="rounded-lg border px-3 py-2 shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">{label}</p>
                        <div className="space-y-1 text-xs">
                          <p>Tickets : {point.tickets} (cumul : {point.cumulTickets})</p>
                          <p>CA : {formatEur(point.revenue)} (cumul : {formatEur(point.cumulRevenue)})</p>
                          {point.posts.length > 0 && (
                            <p className="text-pink-600 dark:text-pink-400 mt-1">
                              Posts : {point.posts.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => {
                    if (value === 'tickets') return 'Tickets/jour';
                    if (value === 'revenue') return 'CA/jour';
                    if (value === 'cumulTickets') return 'Cumul tickets';
                    return value;
                  }}
                />
                {postReferenceDates.map((date) => {
                  const point = chartData.find((d) => d.date === date);
                  if (!point) return null;
                  return (
                    <ReferenceLine
                      key={date}
                      x={point.label}
                      stroke="#ec4899"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: point.posts.join(' · ') || 'Post',
                        position: 'top',
                        fill: '#ec4899',
                        fontSize: 10,
                      }}
                    />
                  );
                })}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="tickets"
                  stroke={CHART_SERIES_COLORS.balanceChart}
                  strokeWidth={2}
                  fill="url(#campaignTicketsGradient)"
                  dot={{ r: 3, fill: CHART_SERIES_COLORS.balanceChart, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART_SERIES_COLORS.balanceChart, strokeWidth: 0 }}
                  name="tickets"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_SERIES_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#campaignRevenueGradient)"
                  dot={{ r: 3, fill: CHART_SERIES_COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: CHART_SERIES_COLORS.revenue, strokeWidth: 0 }}
                  name="revenue"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cumulTickets"
                  stroke={CHART_SERIES_COLORS.balanceChart}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="cumulTickets"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outline">
          <CardContent className="p-8 text-center">
            <BarChart3 size={32} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">Aucune vente enregistrée</p>
            <p className="text-xs text-zinc-400 mt-1">
              Les ventes et les posts planifiés apparaîtront ici.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
