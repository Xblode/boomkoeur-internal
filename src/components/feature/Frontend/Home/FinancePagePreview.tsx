'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Receipt,
  PieChart,
  FileText,
  BarChart3,
  ChevronLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules';
import { CHART_SERIES_COLORS, CHART_UI_COLORS } from '@/lib/constants/chart-colors';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

const FINANCE_SECTIONS = [
  { id: 'tresorerie', label: 'Trésorerie', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budget', label: 'Budget', icon: PieChart },
  { id: 'factures', label: 'Factures', icon: FileText },
  { id: 'bilan', label: 'Bilan', icon: BarChart3 },
] as const;

type FinanceSectionId = (typeof FINANCE_SECTIONS)[number]['id'];

const MOCK_COMPARISON = [
  { name: 'Janv.', Revenus: 42000, Dépenses: 28000 },
  { name: 'Fév.', Revenus: 38000, Dépenses: 32000 },
  { name: 'Mars', Revenus: 51000, Dépenses: 29000 },
  { name: 'Avr.', Revenus: 45000, Dépenses: 35000 },
  { name: 'Mai', Revenus: 62000, Dépenses: 41000 },
];

const MOCK_REVENUE_BREAKDOWN = [
  { source: 'Billetterie', amount: 125000, color: CHART_SERIES_COLORS.billetterie },
  { source: 'Bar', amount: 42000, color: CHART_SERIES_COLORS.bar },
  { source: 'Subventions', amount: 28000, color: CHART_SERIES_COLORS.subventions },
  { source: 'Adhésions', amount: 15000, color: CHART_SERIES_COLORS.adhesions },
  { source: 'Autre', amount: 8000, color: CHART_SERIES_COLORS.autre },
];

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function TresorerieContent() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        <Card variant="outline">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <Wallet size={14} />
              <span className="text-[10px]">Trésorerie actuelle</span>
            </div>
            <p className="text-base font-bold tabular-nums text-green-500">42 500 €</p>
            <p className="text-[10px] text-zinc-400">8 200 € ce mois</p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-[10px]">Revenus du mois</span>
            </div>
            <p className="text-base font-bold tabular-nums text-green-500">12 400 €</p>
            <p className="text-[10px] text-zinc-400">+12% vs mois précédent</p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-[10px]">Dépenses du mois</span>
            </div>
            <p className="text-base font-bold tabular-nums text-red-500">9 800 €</p>
            <p className="text-[10px] text-zinc-400">-5% vs mois précédent</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card variant="outline">
          <CardContent className="p-3">
            <h4 className="text-xs font-semibold mb-2">Finances (Comparaison)</h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={MOCK_COMPARISON} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_UI_COLORS.tickFill }}
                />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: CHART_UI_COLORS.tickFill }}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: '11px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${CHART_UI_COLORS.tooltipBorder}`,
                    backgroundColor: CHART_UI_COLORS.tooltipBg,
                  }}
                  formatter={(value: number | undefined) => [formatEur(value ?? 0), '']}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} iconType="square" />
                <Bar
                  dataKey="Revenus"
                  fill={CHART_SERIES_COLORS.revenue}
                  radius={[3, 3, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="Dépenses"
                  fill={CHART_SERIES_COLORS.expense}
                  radius={[3, 3, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-3">
            <h4 className="text-xs font-semibold mb-2">Répartition Revenus</h4>
            <div className="h-[140px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={MOCK_REVENUE_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="source"
                  >
                    {MOCK_REVENUE_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: '11px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${CHART_UI_COLORS.tooltipBorder}`,
                      backgroundColor: CHART_UI_COLORS.tooltipBg,
                    }}
                    formatter={(value: number | undefined) => [formatEur(value ?? 0), '']}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px' }}
                    iconType="square"
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TransactionsContent() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Transactions</h3>
      <div className="rounded-md border border-border-custom bg-card-bg p-3 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between h-10 rounded bg-surface-subtle px-2" />
        ))}
      </div>
    </div>
  );
}

function BudgetContent() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Budget par projet</h3>
      <div className="grid grid-cols-2 gap-2">
        {['Concert Mars', 'Festival été', 'Soirée DJ'].map((p) => (
          <div key={p} className="rounded-md border border-border-custom bg-card-bg p-3">
            <div className="h-4 w-2/3 bg-surface-subtle rounded mb-2" />
            <div className="h-6 w-1/2 bg-surface-subtle rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FacturesContent() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Factures</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2 items-center rounded-md border border-border-custom bg-card-bg p-2">
            <div className="w-8 h-8 rounded bg-surface-subtle shrink-0" />
            <div className="flex-1 h-4 rounded bg-surface-subtle" />
            <div className="h-4 w-12 rounded bg-surface-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BilanContent() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Compte de résultat</h3>
      <div className="rounded-md border border-border-custom bg-card-bg p-3 space-y-2">
        {['Produits', 'Charges', 'Résultat'].map((l) => (
          <div key={l} className="flex justify-between h-6">
            <span className="text-xs text-muted-foreground">{l}</span>
            <div className="h-4 w-16 bg-surface-subtle rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FinancePageContent({ section }: { section: FinanceSectionId }) {
  switch (section) {
    case 'tresorerie':
      return <TresorerieContent />;
    case 'transactions':
      return <TransactionsContent />;
    case 'budget':
      return <BudgetContent />;
    case 'factures':
      return <FacturesContent />;
    case 'bilan':
      return <BilanContent />;
    default:
      return <TresorerieContent />;
  }
}

/**
 * Mockup de la page Finance du dashboard.
 * Sidebar (Trésorerie, Transactions, Budget, Factures, Bilan) + contenu.
 */
export const FinancePagePreview: React.FC<{ className?: string }> = ({ className }) => {
  const [activeSection, setActiveSection] = useState<FinanceSectionId>('tresorerie');
  const activeIndex = FINANCE_SECTIONS.findIndex((s) => s.id === activeSection);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-2xl',
        'aspect-[21/9] min-h-[400px] max-w-7xl mx-auto',
        className
      )}
    >
      <div className="w-full h-full flex bg-backend">
        {/* Sidebar Finance */}
        <aside className="w-40 min-w-[160px] border-r border-border-custom bg-white dark:bg-backend flex flex-col shrink-0">
          <div className="p-2 border-b border-border-custom flex items-center gap-1 text-muted-foreground">
            <ChevronLeft size={14} />
            <span className="text-[10px]">Retour au dashboard</span>
          </div>
          <div className="p-2 border-b border-border-custom">
            <div className="h-7 rounded bg-surface-subtle text-xs flex items-center justify-center text-muted-foreground">
              Année 2026
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
            {FINANCE_SECTIONS.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 h-7 px-2 rounded-md text-xs w-full text-left transition-colors cursor-pointer',
                  i === activeIndex
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-muted-foreground hover:bg-surface-subtle'
                )}
              >
                <section.icon size={12} />
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto p-4 bg-backend">
          <div className="max-w-3xl">
            <FinancePageContent section={activeSection} />
          </div>
        </main>
      </div>
    </div>
  );
};
