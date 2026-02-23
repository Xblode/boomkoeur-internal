'use client'

import { TrendingUp, TrendingDown, ArrowRight, BarChart as BarChartIcon } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { EmptyState } from '@/components/feature/Backend/Finance/shared/components'
import { Card, CardContent } from '@/components/ui/molecules/Card'
import { cn } from '@/lib/utils'
import { CHART_SERIES_COLORS } from '@/lib/constants/chart-colors'

interface MonthData {
  month: string
  income: number
  expense: number
  balance: number
}

interface MonthlyComparisonCardProps {
  currentMonth: MonthData
  previousMonth: MonthData
  className?: string
}

export default function MonthlyComparisonCard({
  currentMonth,
  previousMonth,
  className = '',
}: MonthlyComparisonCardProps) {
  const incomeChange = previousMonth.income !== 0
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
    : 0
  
  const expenseChange = previousMonth.expense !== 0
    ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100
    : 0
  
  const balanceChange = currentMonth.balance - previousMonth.balance

  const isEmpty = currentMonth.income === 0 && currentMonth.expense === 0 && previousMonth.income === 0 && previousMonth.expense === 0

  const chartData = [
    { name: 'Prev Income', value: previousMonth.income, type: 'prev-income' },
    { name: 'Curr Income', value: currentMonth.income, type: 'curr-income' },
    { name: 'Prev Expense', value: previousMonth.expense, type: 'prev-expense' },
    { name: 'Curr Expense', value: currentMonth.expense, type: 'curr-expense' },
  ]

  const getBarColor = (type: string) => {
    switch (type) {
      case 'prev-income': return `${CHART_SERIES_COLORS.revenue}40`
      case 'curr-income': return CHART_SERIES_COLORS.revenue
      case 'prev-expense': return `${CHART_SERIES_COLORS.expense}40`
      case 'curr-expense': return CHART_SERIES_COLORS.expense
      default: return '#888'
    }
  }

  if (isEmpty) {
    return (
      <div className={className}>
        <EmptyState
          icon={BarChartIcon}
          title="Pas assez de donnees"
          description="Les donnees de comparaison mensuelle apparaitront ici une fois que vous aurez des transactions sur plusieurs mois."
          className="h-[300px]"
        />
      </div>
    )
  }

  return (
    <Card variant="outline" className={className}>
      <CardContent className="p-4">
      <h4 className="text-sm font-semibold mb-4">Comparaison mensuelle</h4>

      {/* Period comparison */}
      <div className="flex items-center justify-center gap-6 mb-6 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40">
        <div className="text-center">
          <p className="text-xs text-zinc-500 mb-1">{previousMonth.month}</p>
          <p className="text-sm font-bold tabular-nums">
            {previousMonth.balance.toLocaleString('fr-FR')} <span className="text-xs text-zinc-500">EUR</span>
          </p>
        </div>
        
        <ArrowRight className="w-4 h-4 text-zinc-400" />
        
        <div className="text-center">
          <p className="text-xs text-zinc-500 mb-1">{currentMonth.month}</p>
          <p className={cn(
            'text-sm font-bold tabular-nums',
            currentMonth.balance >= 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {currentMonth.balance.toLocaleString('fr-FR')} <span className="text-xs opacity-70">EUR</span>
          </p>
        </div>
      </div>

      {/* Comparison chart */}
      <div className="h-24 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingUp size={18} />
            <span className="text-xs">Revenus</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {currentMonth.income.toLocaleString('fr-FR')}
            <span className="text-sm ml-1 text-zinc-500">EUR</span>
          </p>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className={incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
            </span> vs {previousMonth.income.toLocaleString('fr-FR')} EUR
          </p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingDown size={18} />
            <span className="text-xs">Depenses</span>
          </div>
          <p className="text-xl font-bold tabular-nums">
            {currentMonth.expense.toLocaleString('fr-FR')}
            <span className="text-sm ml-1 text-zinc-500">EUR</span>
          </p>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className={expenseChange <= 0 ? 'text-green-500' : 'text-red-500'}>
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
            </span> vs {previousMonth.expense.toLocaleString('fr-FR')} EUR
          </p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-zinc-500">
            {balanceChange >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span className="text-xs">Variation</span>
          </div>
          <p className={cn(
            'text-xl font-bold tabular-nums',
            balanceChange >= 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {balanceChange >= 0 ? '+' : ''}{balanceChange.toLocaleString('fr-FR')}
            <span className="text-sm ml-1 text-zinc-500">EUR</span>
          </p>
          <p className="text-[11px] text-zinc-400">Solde net</p>
          </CardContent>
        </Card>
      </div>
      </CardContent>
    </Card>
  )
}
