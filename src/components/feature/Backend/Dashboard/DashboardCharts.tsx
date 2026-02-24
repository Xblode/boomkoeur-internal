'use client';

import { motion } from 'framer-motion';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { CHART_SERIES_COLORS } from '@/lib/constants/chart-colors';
import { fadeInUp } from '@/lib/animations';

export interface ChartComparisonItem {
  name: string;
  Revenus: number;
  Dépenses: number;
}

export interface RevenueBreakdownItem {
  source: string;
  amount: number;
  color: string;
}

export interface DashboardChartsData {
  comparisonData: ChartComparisonItem[];
  revenueBreakdown: RevenueBreakdownItem[];
}

interface DashboardChartsProps {
  data: DashboardChartsData;
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="rounded-lg shadow-sm border-border-custom overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-semibold">Finances (Comparaison)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparisonData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--color-text-tertiary)' }}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                  tick={{ fill: 'var(--color-text-tertiary)' }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                  }}
                  formatter={(value: number | undefined) => [`${value ?? 0} €`, '']}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="square"
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
                <Bar
                  dataKey="Revenus"
                  fill={CHART_SERIES_COLORS.revenue}
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                />
                <Bar
                  dataKey="Dépenses"
                  fill={CHART_SERIES_COLORS.expense}
                  radius={[4, 4, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm border-border-custom overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base font-semibold">Répartition Revenus</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[200px] flex items-center justify-center">
            {data.revenueBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <PieChartIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée ce mois</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="source"
                >
                  {data.revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                  }}
                  formatter={(value: number | undefined) => [`${value ?? 0} €`, '']}
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
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
