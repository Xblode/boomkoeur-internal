'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { CHART_SERIES_COLORS, CHART_UI_COLORS } from '@/lib/constants/chart-colors';
import type { EventPosSale, EventPosProductWithVariants } from '@/types/eventPos';
import type { Event } from '@/types/event';
import type { ShotgunTicket } from '@/types/shotgun';
import { getShotgunTicketsCache, setShotgunTicketsCache } from '@/lib/localStorage/shotgun';
import { useOrg } from '@/hooks';

const CATEGORY_LABELS: Record<string, string> = {
  alcool: 'Boissons',
  merch: 'Merch',
  billet: 'Billet',
  autre: 'Autre',
};

const CATEGORY_COLORS: Record<string, string> = {
  alcool: CHART_SERIES_COLORS.bar ?? '#3b82f6',
  merch: CHART_SERIES_COLORS.merchandising ?? '#a855f7',
  billet: CHART_SERIES_COLORS.billetterie ?? '#10b981',
  autre: CHART_SERIES_COLORS.autre ?? '#71717a',
};

const FORMAT_ORDER = [25, 33, 50, 75, 100];

/** Couleurs distinctes par format (25cl, 33cl, 50cl, 75cl, 100cl, Autre) */
const FORMAT_COLORS = [
  '#10b981', // 25cl - vert
  '#3b82f6', // 33cl - bleu
  '#a855f7', // 50cl - violet
  '#f59e0b', // 75cl - orange
  '#ef4444', // 100cl - rouge
  '#71717a', // Autre - gris
];

function formatEur(n: number): string {
  return `${n.toFixed(2)} €`;
}

/** Arrondit HH:mm à la tranche de 30min inférieure (19:06 → 19:00, 19:36 → 19:30) */
function slotFromTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const slotMin = m < 30 ? 0 : 30;
  return `${String(h).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;
}

/** Convertit HH:mm en minutes depuis minuit. Si event dépasse minuit, les créneaux 00:00-11:30 sont traités comme lendemain. */
function slotToOrderedMins(slot: string, eventStart: string, eventEnd: string): number {
  const [h, m] = slot.split(':').map(Number);
  let mins = h * 60 + m;
  const [sh, sm] = eventStart.split(':').map(Number);
  const [eh, em] = eventEnd.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const spansMidnight = endMins <= startMins;
  if (spansMidnight && mins < 12 * 60) mins += 24 * 60; // 00:00-11:30 = lendemain
  return mins;
}

/** Compare deux créneaux dans l'ordre chronologique de l'event (gère le passage à minuit) */
function isSlotBefore(slot: string, other: string, eventStart: string, eventEnd: string): boolean {
  return slotToOrderedMins(slot, eventStart, eventEnd) < slotToOrderedMins(other, eventStart, eventEnd);
}

function isSlotAfter(slot: string, other: string, eventStart: string, eventEnd: string): boolean {
  return slotToOrderedMins(slot, eventStart, eventEnd) > slotToOrderedMins(other, eventStart, eventEnd);
}

/** Génère les créneaux de 30min entre start et end (inclus). Gère les events qui finissent après minuit (ex: 19h → 2h). */
function generateSlots(start: string, end: string): string[] {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) endMins += 24 * 60; // event dépasse minuit
  const slots: string[] = [];
  for (let m = startMins; m <= endMins; m += 30) {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }
  return slots;
}

interface PosSalesChartProps {
  sales: EventPosSale[];
  products: EventPosProductWithVariants[];
  event?: Event;
}

export function PosSalesChart({ sales, products, event }: PosSalesChartProps) {
  const { activeOrg } = useOrg();
  const [tickets, setTickets] = useState<ShotgunTicket[]>([]);

  const fetchTickets = useCallback(
    async (force = false) => {
      if (!event?.shotgunEventId) return;
      if (!force) {
        const cached = getShotgunTicketsCache(event.shotgunEventId);
        if (cached) {
          setTickets(cached);
          return;
        }
      }
      try {
        const params = new URLSearchParams({
          event_id: String(event.shotgunEventId),
          fetch_all: '1',
        });
        const headers: Record<string, string> = {};
        if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
        const res = await fetch(`/api/shotgun/tickets?${params.toString()}`, { headers });
        if (!res.ok) return;
        const json = await res.json();
        const data: ShotgunTicket[] = json.data ?? [];
        setTickets(data);
        setShotgunTicketsCache(event.shotgunEventId!, data);
      } catch {
        // Silencieux
      }
    },
    [event?.shotgunEventId, activeOrg?.id]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const { formatData, categoryData, productData } = useMemo(() => {
    const byFormat = new Map<string, { ca: number; qty: number }>();
    const byCategory = new Map<string, { ca: number; qty: number }>();
    const byProduct = new Map<string, { name: string; category: string; ca: number; qty: number }>();

    for (const s of sales) {
      const product = products.find((p) => p.id === s.event_pos_product_id);
      const variant = product?.variants.find((v) => v.id === s.event_pos_variant_id);
      const saleUnitCl = variant?.sale_unit_cl;
      const formatKey = saleUnitCl ? `${saleUnitCl}cl` : 'Autre';
      const curFormat = byFormat.get(formatKey) ?? { ca: 0, qty: 0 };
      curFormat.ca += s.total;
      curFormat.qty += s.quantity;
      byFormat.set(formatKey, curFormat);

      const cat = product?.category ?? 'alcool';
      const curCat = byCategory.get(cat) ?? { ca: 0, qty: 0 };
      curCat.ca += s.total;
      curCat.qty += s.quantity;
      byCategory.set(cat, curCat);

      const key = s.event_pos_product_id;
      const curProd = byProduct.get(key) ?? {
        name: product?.name ?? '(Produit inconnu)',
        category: cat,
        ca: 0,
        qty: 0,
      };
      curProd.ca += s.total;
      curProd.qty += s.quantity;
      byProduct.set(key, curProd);
    }

    const formatData = [
      ...FORMAT_ORDER.filter((cl) => byFormat.has(`${cl}cl`)).map((cl) => {
        const key = `${cl}cl`;
        const cur = byFormat.get(key)!;
        return { name: key, value: cur.ca, qty: cur.qty };
      }),
      ...(byFormat.has('Autre') ? [{ name: 'Autre', value: byFormat.get('Autre')!.ca, qty: byFormat.get('Autre')!.qty }] : []),
    ];

    const categoryData = ['alcool', 'merch', 'billet', 'autre']
      .filter((c) => byCategory.has(c))
      .map((c) => ({
        name: CATEGORY_LABELS[c],
        value: byCategory.get(c)!.ca,
        qty: byCategory.get(c)!.qty,
      }));

    const productData = Array.from(byProduct.values())
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 12);

    return { formatData, categoryData, productData };
  }, [sales, products]);

  const timeSlotData = useMemo(() => {
    if (!event) return null;
    const eventDate = new Date(event.date).toISOString().slice(0, 10);
    const eventStart = format(
      event.date,
      'HH:mm'
    );
    const eventEnd = event.endTime ?? '23:59';
    const toMins = (t: string) =>
      t.split(':').reduce((acc, part, i) => acc + (i === 0 ? parseInt(part, 10) * 60 : parseInt(part, 10)), 0);
    const spansMidnight = toMins(eventEnd) <= toMins(eventStart);

    const nextDay = new Date(eventDate + 'T12:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().slice(0, 10);

    const salesWithTime = sales.filter((s) => {
      if (!s.sale_time) return false;
      if (s.sale_date === eventDate) return true;
      if (spansMidnight && s.sale_date === nextDayStr) {
        const saleOrdered = slotToOrderedMins(s.sale_time, eventStart, eventEnd);
        const endOrdered = slotToOrderedMins(eventEnd, eventStart, eventEnd);
        return saleOrdered <= endOrdered;
      }
      return false;
    });
    if (salesWithTime.length === 0) return null;

    const slotMap = new Map<string, number>();
    let minSlot = eventStart;
    let maxSlot = eventEnd;

    for (const s of salesWithTime) {
      const slot = slotFromTime(s.sale_time!);
      slotMap.set(slot, (slotMap.get(slot) ?? 0) + s.total);
      if (isSlotBefore(slot, minSlot, eventStart, eventEnd)) minSlot = slot;
      if (isSlotAfter(slot, maxSlot, eventStart, eventEnd)) maxSlot = slot;
    }

    const slots = generateSlots(minSlot, maxSlot);

    const ticketSlotMap = new Map<string, number>();
    if (event.shotgunEventId && tickets.length > 0) {
      const validScanned = tickets.filter(
        (t) => t.ticket_status === 'valid' && t.ticket_scanned_at
      );
      for (const t of validScanned) {
        const d = new Date(t.ticket_scanned_at!);
        if (isNaN(d.getTime())) continue;
        const scanDate = format(d, 'yyyy-MM-dd');
        const scanTime = format(d, 'HH:mm');
        if (scanDate === eventDate) {
          const slot = slotFromTime(scanTime);
          ticketSlotMap.set(slot, (ticketSlotMap.get(slot) ?? 0) + 1);
        } else if (spansMidnight && scanDate === nextDayStr) {
          const scanOrdered = slotToOrderedMins(scanTime, eventStart, eventEnd);
          const endOrdered = slotToOrderedMins(eventEnd, eventStart, eventEnd);
          if (scanOrdered <= endOrdered) {
            const slot = slotFromTime(scanTime);
            ticketSlotMap.set(slot, (ticketSlotMap.get(slot) ?? 0) + 1);
          }
        }
      }
    }

    return slots.map((slot) => ({
      slot,
      label: slot.replace(':', 'h'),
      revenue: slotMap.get(slot) ?? 0,
      tickets: ticketSlotMap.get(slot) ?? 0,
    }));
  }, [sales, event, tickets]);

  if (sales.length === 0) {
    return (
      <Card variant="outline">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
            <PieChartIcon size={32} className="opacity-50" />
            <p className="text-sm">Aucune vente enregistrée</p>
            <p className="text-xs">Importez vos ventes CSV pour afficher les statistiques</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tooltipStyle = {
    borderRadius: '8px',
    border: `1px solid ${CHART_UI_COLORS.tooltipBorder}`,
    fontSize: '12px',
    backgroundColor: CHART_UI_COLORS.tooltipBg,
  };

  return (
    <div className="space-y-4">
      {/* Évolution du CA par tranche de 30min */}
      {timeSlotData && timeSlotData.length >= 1 && (
        <Card variant="outline">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <TrendingUp size={16} />
              Évolution du CA par tranche de 30 min
              {event?.shotgunEventId && (
                <span className="text-xs font-normal text-zinc-500">
                  — Tickets scannés (Shotgun)
                </span>
              )}
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={timeSlotData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="posRevenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={CHART_SERIES_COLORS.revenue}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_SERIES_COLORS.revenue}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient
                    id="posTicketsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={CHART_SERIES_COLORS.balanceChart}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_SERIES_COLORS.balanceChart}
                      stopOpacity={0.02}
                    />
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
                {event?.shotgunEventId && timeSlotData.some((d) => d.tickets > 0) ? (
                  <>
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
                      tickFormatter={(v) => `${v} €`}
                    />
                  </>
                ) : (
                  <YAxis
                    tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v) => `${v} €`}
                  />
                )}
                <Tooltip
                  contentStyle={tooltipStyle}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0]?.payload as
                      | { label: string; revenue: number; tickets: number }
                      | undefined;
                    if (!point) return null;
                    return (
                      <div className="rounded-lg border px-3 py-2 shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                          {point.label}
                        </p>
                        <div className="space-y-1 text-xs">
                          <p>CA : {formatEur(point.revenue)}</p>
                          {event?.shotgunEventId && (
                            <p>Tickets scannés : {point.tickets}</p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                {event?.shotgunEventId && timeSlotData.some((d) => d.tickets > 0) && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="tickets"
                    stroke={CHART_SERIES_COLORS.balanceChart}
                    strokeWidth={2}
                    fill="url(#posTicketsGradient)"
                    dot={(props) => {
                      const { payload, cx, cy } = props;
                      if (!payload?.tickets || payload.tickets <= 0) return null;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={CHART_SERIES_COLORS.balanceChart}
                        />
                      );
                    }}
                    activeDot={{
                      r: 6,
                      fill: CHART_SERIES_COLORS.balanceChart,
                      strokeWidth: 0,
                    }}
                    name="Tickets scannés"
                  />
                )}
                <Area
                  yAxisId={event?.shotgunEventId && timeSlotData.some((d) => d.tickets > 0) ? 'right' : undefined}
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_SERIES_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#posRevenueGradient)"
                  dot={(props) => {
                    const { payload, cx, cy } = props;
                    if (!payload?.revenue || payload.revenue <= 0) return null;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={CHART_SERIES_COLORS.revenue}
                      />
                    );
                  }}
                  activeDot={{
                    r: 6,
                    fill: CHART_SERIES_COLORS.revenue,
                    strokeWidth: 0,
                  }}
                  name="CA"
                />
                {event?.shotgunEventId && timeSlotData.some((d) => d.tickets > 0) && (
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Répartition par format (25cl, 50cl...) */}
      {formatData.length >= 1 && (
        <Card variant="outline">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <BarChart3 size={16} />
              Répartition par format
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {formatData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={FORMAT_COLORS[index % FORMAT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, _name, props) => {
                    const p = (props as { payload?: { qty?: number } })?.payload;
                    return [`${formatEur(Number(value ?? 0))} (${p?.qty ?? 0} vendus)`, ''];
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="square"
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Répartition par catégorie (Boissons, Merch, Billet) */}
      {categoryData.length >= 1 && (
        <Card variant="outline">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <PieChartIcon size={16} />
              Répartition par catégorie
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === 'Boissons'
                          ? CHART_SERIES_COLORS.bar ?? '#3b82f6'
                          : entry.name === 'Merch'
                            ? CHART_SERIES_COLORS.merchandising ?? '#a855f7'
                            : entry.name === 'Billet'
                              ? CHART_SERIES_COLORS.billetterie ?? '#10b981'
                              : CHART_SERIES_COLORS.autre ?? '#71717a'
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, _name, props) => {
                    const p = (props as { payload?: { qty?: number } })?.payload;
                    return [`${formatEur(Number(value ?? 0))} (${p?.qty ?? 0} vendus)`, ''];
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="square"
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* CA par produit */}
      {productData.length >= 1 && (
        <Card variant="outline" className="md:col-span-2">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <BarChart3 size={16} />
              CA par produit
            </h4>
            <ResponsiveContainer width="100%" height={Math.max(200, productData.length * 28)}>
              <BarChart
                data={productData}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_UI_COLORS.gridStroke}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v} €`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v.length > 18 ? v.slice(0, 17) + '…' : v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, _name, props) => {
                    const p = (props as { payload?: { qty?: number; category?: string } })?.payload;
                    return [
                      `${formatEur(Number(value ?? 0))} (${p?.qty ?? 0} vendus)`,
                      CATEGORY_LABELS[p?.category ?? 'alcool'] ?? p?.category ?? 'CA',
                    ];
                  }}
                />
                <Bar dataKey="ca" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {productData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.category] ?? CHART_SERIES_COLORS.balanceChart}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
