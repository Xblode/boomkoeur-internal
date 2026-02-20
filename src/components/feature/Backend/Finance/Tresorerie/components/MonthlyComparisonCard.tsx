'use client'

import { Card, CardContent } from '@/components/ui/molecules'
import { TrendingUp, TrendingDown, ArrowRight, BarChart as BarChartIcon } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { EmptyState } from '@/components/feature/Backend/Finance/shared/components'

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
      case 'prev-income': return '#22c55e40'
      case 'curr-income': return '#22c55e'
      case 'prev-expense': return '#ef444440'
      case 'curr-expense': return '#ef4444'
      default: return '#888'
    }
  }

  return (
    <div className={className}>
      <h3 className="font-heading text-2xl font-bold uppercase mb-4 mt-8">
        Comparaison mensuelle
      </h3>
      
      {isEmpty ? (
        <EmptyState
          icon={BarChartIcon}
          title="Pas assez de donnees"
          description="Les donnees de comparaison mensuelle apparaitront ici une fois que vous aurez des transactions sur plusieurs mois."
          className="h-[400px]"
        />
      ) : (
        <Card>
          <CardContent className="p-6">
        {/* Periode */}
        <div className="flex items-center justify-center gap-6 mb-8 p-4 rounded-lg border border-border-custom">
          <div className="text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {previousMonth.month}
            </p>
            <p className="font-mono text-base font-bold text-foreground">
              {previousMonth.balance.toLocaleString('fr-FR')} <span className="text-xs text-zinc-500">EUR</span>
            </p>
          </div>
          
          <ArrowRight className="w-6 h-6 text-zinc-400" />
          
          <div className="text-center">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {currentMonth.month}
            </p>
            <p className={`font-mono text-base font-bold ${
              currentMonth.balance >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {currentMonth.balance.toLocaleString('fr-FR')} <span className="text-xs opacity-70">EUR</span>
            </p>
          </div>
        </div>

        {/* Graphique comparatif */}
        <div className="h-28 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Metriques detaillees */}
        <div className="grid grid-cols-3 gap-4">
          {/* Revenus */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500">Revenus</p>
                <TrendingUp className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold">
                {currentMonth.income.toLocaleString('fr-FR')}
                <span className="text-sm ml-1 text-zinc-500">EUR</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span className={incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                </span> vs {previousMonth.income.toLocaleString('fr-FR')} EUR
              </p>
            </CardContent>
          </Card>

          {/* Depenses */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500">Depenses</p>
                <TrendingDown className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold">
                {currentMonth.expense.toLocaleString('fr-FR')}
                <span className="text-sm ml-1 text-zinc-500">EUR</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <span className={expenseChange <= 0 ? 'text-green-500' : 'text-red-500'}>
                  {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                </span> vs {previousMonth.expense.toLocaleString('fr-FR')} EUR
              </p>
            </CardContent>
          </Card>

          {/* Variation nette */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500">Variation</p>
                {balanceChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-zinc-400" />
                )}
              </div>
              <div className={`text-2xl font-bold ${
                balanceChange >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {balanceChange >= 0 ? '+' : ''}{balanceChange.toLocaleString('fr-FR')}
                <span className="text-sm ml-1 text-zinc-500">EUR</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Solde net
              </p>
            </CardContent>
          </Card>
        </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

