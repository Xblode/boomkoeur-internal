'use client'

import { useState } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { TrendingUp, TrendingDown, AlertCircle, Download, Wallet, Activity, Plus, Calendar, Layout } from 'lucide-react'
import { Button } from '@/components/ui/atoms'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/molecules'
import { EmptyState } from '@/components/feature/Backend/Finance/shared/components'

type PeriodType = 'month' | 'quarter' | 'year'
type ChartType = 'area' | 'line' | 'bar' | 'composed'

interface ChartData {
  date: string
  balance: number
  income: number
  expense: number
}

interface TreasuryChartEnhancedProps {
  data: ChartData[]
  loading: boolean
  period: PeriodType
  selectedYear: number
  onPeriodChange: (period: PeriodType) => void
  onYearChange: (year: number) => void
  onAddTransaction?: () => void
  className?: string
}

export default function TreasuryChartEnhanced({ 
  data, 
  loading, 
  period,
  selectedYear,
  onPeriodChange,
  onYearChange,
  onAddTransaction,
  className = '' 
}: TreasuryChartEnhancedProps) {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [showIncome, setShowIncome] = useState(true)
  const [showExpense, setShowExpense] = useState(true)
  const [showBalance, setShowBalance] = useState(true)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (period === 'year') {
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR')} EUR`
  }

  // Calculer les statistiques
  const stats = {
    current: data.length > 0 ? data[data.length - 1].balance : 0,
    min: Math.min(...data.map(d => d.balance)),
    max: Math.max(...data.map(d => d.balance)),
    avg: data.reduce((sum, d) => sum + d.balance, 0) / (data.length || 1),
    totalIncome: data.reduce((sum, d) => sum + d.income, 0),
    totalExpense: data.reduce((sum, d) => sum + d.expense, 0),
  }

  const trend = data.length > 1 
    ? ((data[data.length - 1].balance - data[0].balance) / Math.abs(data[0].balance || 1)) * 100
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card-bg border-2 border-accent p-4 shadow-xl">
          <p className="font-label text-xs text-zinc-500 mb-2">
            {new Date(label).toLocaleDateString('fr-FR', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              let icon = null
              let label = entry.name
              let color = entry.color
              
              if (entry.dataKey === 'balance') {
                icon = entry.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
                label = 'Solde'
                color = entry.value >= 0 ? '#22c55e' : '#ef4444'
              } else if (entry.dataKey === 'income') {
                icon = <TrendingUp className="w-3 h-3" />
                label = 'Entrees'
              } else if (entry.dataKey === 'expense') {
                icon = <TrendingDown className="w-3 h-3" />
                label = 'Sorties'
              }
              
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div style={{ color }}>{icon}</div>
                    <span className="text-sm" style={{ color }}>{label}</span>
                  </div>
                  <span className="font-mono font-bold text-sm" style={{ color }}>
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 20, bottom: 5 }
    }

    const xAxisProps = {
      dataKey: "date",
      tickFormatter: formatDate,
      stroke: "#888",
      style: { fontSize: '11px', fontFamily: 'var(--font-space-mono)' },
      tick: { fill: '#888' }
    }

    const yAxisProps = {
      tickFormatter: (value: number) => `${(value / 1000).toFixed(0)}kEUR`,
      stroke: "#888",
      style: { fontSize: '11px', fontFamily: 'var(--font-space-mono)' },
      tick: { fill: '#888' }
    }

    const gridProps = {
      strokeDasharray: "3 3",
      stroke: "#333",
      opacity: 0.3
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5500" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF5500" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && (
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorIncome)"
                name="income"
              />
            )}
            {showExpense && (
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorExpense)"
                name="expense"
              />
            )}
            {showBalance && (
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#FF5500"
                strokeWidth={3}
                fill="url(#colorBalance)"
                name="balance"
              />
            )}
          </AreaChart>
        )
      
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && (
              <Bar dataKey="income" fill="#22c55e" opacity={0.6} name="income" />
            )}
            {showExpense && (
              <Bar dataKey="expense" fill="#ef4444" opacity={0.6} name="expense" />
            )}
            {showBalance && (
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#FF5500"
                strokeWidth={3}
                dot={{ fill: '#FF5500', r: 3 }}
                name="balance"
              />
            )}
          </ComposedChart>
        )
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && <Bar dataKey="income" fill="#22c55e" name="income" />}
            {showExpense && <Bar dataKey="expense" fill="#ef4444" name="expense" />}
            {showBalance && <Bar dataKey="balance" fill="#FF5500" name="balance" />}
          </BarChart>
        )
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && (
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="income"
              />
            )}
            {showExpense && (
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="expense"
              />
            )}
            {showBalance && (
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#FF5500"
                strokeWidth={3}
                dot={false}
                name="balance"
              />
            )}
          </LineChart>
        )
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
            <p className="text-zinc-500">Chargement des donnees...</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={TrendingUp}
          title="Aucune donnee de tresorerie"
          description={`Aucune transaction trouvee pour ${selectedYear}. Ajoutez des transactions ou changez d'annee.`}
          className="h-[500px]"
          action={
            <div className="flex flex-col items-center gap-8">
              {onAddTransaction && (
                <Button onClick={onAddTransaction} variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une transaction
                </Button>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                  {(['month', 'quarter', 'year'] as PeriodType[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => onPeriodChange(p)}
                      className={`px-2 py-1 text-[10px] font-medium uppercase transition-all rounded-md ${
                        period === p
                          ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-zinc-500 hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      {p === 'month' ? 'Mois' : p === 'quarter' ? 'Trim.' : 'Annee'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <button
                      key={year}
                      onClick={() => onYearChange(year)}
                      className={`px-2 py-1 text-[10px] font-medium uppercase transition-all rounded-md ${
                        selectedYear === year
                          ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                          : 'text-zinc-500 hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Section Header avec contrôles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 mt-8">
        <h3 className="font-heading text-2xl font-bold uppercase">
          Evolution de la tresorerie
        </h3>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Période */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
            {(['month', 'quarter', 'year'] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-3 py-1 text-xs font-medium uppercase transition-all rounded-md ${
                  period === p
                    ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-zinc-500 hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                }`}
              >
                {p === 'month' ? 'Mois' : p === 'quarter' ? 'Trim.' : 'Annee'}
              </button>
            ))}
          </div>
          
          {/* Années */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
            {[2025, 2026, 2027, 2028].map((year) => (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className={`px-3 py-1 text-xs font-medium uppercase transition-all rounded-md ${
                  selectedYear === year
                    ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-zinc-500 hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          
          <span className="text-xs text-zinc-500 uppercase tracking-wider mx-2 font-medium">Visualisation:</span>
          
          {/* Type de graphique */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
            {(['area', 'line', 'bar', 'composed'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-xs font-medium uppercase transition-all rounded-md ${
                  chartType === type
                    ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-zinc-500 hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Export */}
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats principales avec icônes à gauche */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.current >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Wallet className={`w-5 h-5 ${stats.current >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Solde actuel</p>
                <p className={`font-mono text-xl font-bold ${stats.current >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(stats.current)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${trend >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {trend >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tendance</p>
                <p className={`font-mono text-xl font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Moy. periode</p>
                <p className="font-mono text-xl font-bold text-foreground">
                  {formatCurrency(stats.avg)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="py-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Légende interactive */}
          <div className="flex items-center justify-center gap-3 text-xs mt-6">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className={`flex items-center gap-2 px-2 py-1 transition-all rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                showBalance ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="font-label">Solde</span>
            </button>
            <button
              onClick={() => setShowIncome(!showIncome)}
              className={`flex items-center gap-2 px-2 py-1 transition-all rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                showIncome ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="font-label">Entrees</span>
            </button>
            <button
              onClick={() => setShowExpense(!showExpense)}
              className={`flex items-center gap-2 px-2 py-1 transition-all rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                showExpense ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="font-label">Sorties</span>
            </button>
          </div>

          {/* Alertes */}
          {stats.current < 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-400">Tresorerie negative</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Votre solde est actuellement negatif. Verifiez vos previsions et ajustez vos depenses.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barre de statistiques secondaires */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase mb-1">Total entrees</p>
            <p className="font-mono text-sm font-bold text-green-400">
              +{formatCurrency(stats.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase mb-1">Total sorties</p>
            <p className="font-mono text-sm font-bold text-red-400">
              -{formatCurrency(stats.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase mb-1">Maximum</p>
            <p className="font-mono text-sm font-bold text-foreground">
              {formatCurrency(stats.max)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase mb-1">Minimum</p>
            <p className="font-mono text-sm font-bold text-foreground">
              {formatCurrency(stats.min)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

