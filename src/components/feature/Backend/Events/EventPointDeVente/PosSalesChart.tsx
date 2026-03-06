'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
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
} from 'recharts';
import { CHART_SERIES_COLORS, CHART_UI_COLORS, CHART_CATEGORY_COLORS } from '@/lib/constants/chart-colors';
import type { EventPosSale, EventPosProductWithVariants } from '@/types/eventPos';

const CATEGORY_LABELS: Record<string, string> = {
  alcool: 'Boissons',
  merch: 'Merch',
  billet: 'Billet',
};

const CATEGORY_COLORS: Record<string, string> = {
  alcool: CHART_SERIES_COLORS.bar ?? '#3b82f6',
  merch: CHART_SERIES_COLORS.merchandising ?? '#a855f7',
  billet: CHART_SERIES_COLORS.billetterie ?? '#10b981',
};

const FORMAT_ORDER = [25, 33, 50, 75, 100];

function formatEur(n: number): string {
  return `${n.toFixed(2)} €`;
}

interface PosSalesChartProps {
  sales: EventPosSale[];
  products: EventPosProductWithVariants[];
}

export function PosSalesChart({ sales, products }: PosSalesChartProps) {
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

    const categoryData = ['alcool', 'merch', 'billet']
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
                >
                  {formatData.map((_, index) => (
                    <Cell
                      key={formatData[index].name}
                      fill={CHART_CATEGORY_COLORS[index % CHART_CATEGORY_COLORS.length]}
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
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === 'Boissons'
                          ? CHART_SERIES_COLORS.bar ?? '#3b82f6'
                          : entry.name === 'Merch'
                            ? CHART_SERIES_COLORS.merchandising ?? '#a855f7'
                            : CHART_SERIES_COLORS.billetterie ?? '#10b981'
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
  );
}
