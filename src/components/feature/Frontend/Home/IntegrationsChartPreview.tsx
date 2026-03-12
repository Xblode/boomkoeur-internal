'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { CHART_SERIES_COLORS, CHART_UI_COLORS } from '@/lib/constants/chart-colors';
import { Ticket, DollarSign, Image, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

function formatEur(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

const MOCK_DATA = [
  { date: '2026-01', label: '1 Jan', tickets: 12, revenue: 24000, cumulTickets: 12, cumulRevenue: 24000, posts: [] },
  { date: '2026-02', label: '5 Jan', tickets: 28, revenue: 56000, cumulTickets: 40, cumulRevenue: 80000, posts: ['Annonce'] },
  { date: '2026-03', label: '10 Jan', tickets: 45, revenue: 90000, cumulTickets: 85, cumulRevenue: 170000, posts: [] },
  { date: '2026-04', label: '15 Jan', tickets: 32, revenue: 64000, cumulTickets: 117, cumulRevenue: 234000, posts: ['Line-up'] },
  { date: '2026-05', label: '20 Jan', tickets: 58, revenue: 116000, cumulTickets: 175, cumulRevenue: 350000, posts: [] },
  { date: '2026-06', label: '25 Jan', tickets: 41, revenue: 82000, cumulTickets: 216, cumulRevenue: 432000, posts: ['Billetterie'] },
  { date: '2026-07', label: '1 Fév', tickets: 67, revenue: 134000, cumulTickets: 283, cumulRevenue: 566000, posts: [] },
];

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
      <CardContent className="p-3 sm:p-4 space-y-1">
        <div className="flex items-center gap-2 text-zinc-500">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-lg sm:text-xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-[10px] sm:text-[11px] text-zinc-400">{sub}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Mockup du chart "Suivi campagne" (style EventCampaignChart).
 * Ventes Shotgun + publications Instagram.
 */
export const IntegrationsChartPreview: React.FC<{ className?: string }> = ({ className }) => {
  const postDates = MOCK_DATA.filter((d) => d.posts.length > 0);
  const maxTickets = Math.max(...MOCK_DATA.map((d) => d.tickets), 1);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-2xl p-4',
        className
      )}
    >
      <h3 className="text-sm font-semibold mb-4">
        Suivi campagne — Ventes et publications Instagram
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          icon={<Ticket size={16} />}
          label="Tickets vendus"
          value="283"
        />
        <KpiCard
          icon={<DollarSign size={16} />}
          label="CA brut"
          value="5 660 €"
        />
        <KpiCard
          icon={<Image size={16} />}
          label="Posts publiés"
          value="3"
          sub="5 planifiés"
        />
        <KpiCard
          icon={<BarChart3 size={16} />}
          label="Ventes depuis campagne"
          value="216"
          sub="Depuis 1 Jan"
        />
      </div>

      <Card variant="outline">
        <CardContent className="p-3 sm:p-4">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={MOCK_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="previewTicketsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_SERIES_COLORS.balanceChart} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_SERIES_COLORS.balanceChart} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="previewRevenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                tick={{ fontSize: 10, fill: CHART_UI_COLORS.tickFill }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: CHART_UI_COLORS.tickFill }}
                tickLine={false}
                axisLine={false}
                width={28}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: CHART_UI_COLORS.tickFill }}
                tickLine={false}
                axisLine={false}
                width={36}
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
                  const point = payload[0]?.payload as (typeof MOCK_DATA)[0] | undefined;
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
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value) => {
                  if (value === 'tickets') return 'Tickets/jour';
                  if (value === 'revenue') return 'CA/jour';
                  if (value === 'cumulTickets') return 'Cumul tickets';
                  return value;
                }}
              />
              {postDates.map((point) => (
                <React.Fragment key={point.date}>
                  <ReferenceLine
                    x={point.label}
                    stroke="#ec4899"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: point.posts[0] ?? 'Post',
                      position: 'top',
                      fill: '#ec4899',
                      fontSize: 9,
                    }}
                  />
                  <ReferenceDot
                    x={point.label}
                    y={maxTickets}
                    yAxisId="left"
                    r={4}
                    fill="#ec4899"
                    stroke="#ec4899"
                    strokeWidth={2}
                  />
                </React.Fragment>
              ))}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="tickets"
                stroke={CHART_SERIES_COLORS.balanceChart}
                strokeWidth={2}
                fill="url(#previewTicketsGradient)"
                dot={{ r: 2, fill: CHART_SERIES_COLORS.balanceChart, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: CHART_SERIES_COLORS.balanceChart, strokeWidth: 0 }}
                name="tickets"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={CHART_SERIES_COLORS.revenue}
                strokeWidth={2}
                fill="url(#previewRevenueGradient)"
                dot={{ r: 2, fill: CHART_SERIES_COLORS.revenue, strokeWidth: 0 }}
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
    </div>
  );
};
