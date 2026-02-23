'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Download, Wallet, Activity, Plus, Info } from 'lucide-react'
import { Button } from '@/components/ui/atoms'
import { ToggleGroup } from '@/components/ui/molecules'
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
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts'
import { EmptyState } from '@/components/feature/Backend/Finance/shared/components'
import { Card, CardContent } from '@/components/ui/molecules'
import { cn } from '@/lib/utils'
import { CHART_SERIES_COLORS, CHART_UI_COLORS } from '@/lib/constants/chart-colors'

const BALANCE_COLOR = CHART_SERIES_COLORS.balanceChart ?? CHART_SERIES_COLORS.balance
const INCOME_COLOR = CHART_SERIES_COLORS.revenue
const EXPENSE_COLOR = CHART_SERIES_COLORS.expense

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
  onAddTransaction?: () => void
  className?: string
}

export default function TreasuryChartEnhanced({ 
  data, 
  loading, 
  period,
  selectedYear,
  onPeriodChange,
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
        <div style={{
          borderRadius: '8px',
          border: `1px solid ${CHART_UI_COLORS.tooltipBorder}`,
          fontSize: '12px',
          backgroundColor: CHART_UI_COLORS.tooltipBg,
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <p className="text-xs text-zinc-500 mb-2">
            {new Date(label).toLocaleDateString('fr-FR', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              let entryLabel = entry.name
              let color = entry.color
              
              if (entry.dataKey === 'balance') {
                entryLabel = 'Solde'
                color = BALANCE_COLOR
              } else if (entry.dataKey === 'income') {
                entryLabel = 'Entrees'
                color = INCOME_COLOR
              } else if (entry.dataKey === 'expense') {
                entryLabel = 'Sorties'
                color = EXPENSE_COLOR
              }
              
              return (
                <div key={index} className="flex items-center justify-between gap-4">
                  <span className="text-xs" style={{ color }}>{entryLabel}</span>
                  <span className="font-bold text-xs tabular-nums" style={{ color }}>
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
      margin: { top: 8, right: 8, left: 0, bottom: 0 }
    }

    const xAxisProps = {
      dataKey: "date" as const,
      tickFormatter: formatDate,
      tick: { fontSize: 11, fill: CHART_UI_COLORS.tickFill },
      tickLine: false,
      axisLine: false,
    }

    const yAxisProps = {
      tickFormatter: (value: number) => `${(value / 1000).toFixed(0)}k`,
      tick: { fontSize: 11, fill: CHART_UI_COLORS.tickFill },
      tickLine: false,
      axisLine: false,
      width: 40,
    }

    const gridProps = {
      strokeDasharray: "3 3" as const,
      stroke: CHART_UI_COLORS.gridStroke,
      vertical: false,
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BALANCE_COLOR} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={BALANCE_COLOR} stopOpacity={0.02}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0.02}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(113,113,122,0.3)" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && (
              <Area
                type="monotone"
                dataKey="income"
                stroke={INCOME_COLOR}
                strokeWidth={2}
                fill="url(#colorIncome)"
                name="income"
              />
            )}
            {showExpense && (
              <Area
                type="monotone"
                dataKey="expense"
                stroke={EXPENSE_COLOR}
                strokeWidth={2}
                fill="url(#colorExpense)"
                name="expense"
              />
            )}
            {showBalance && (
              <Area
                type="monotone"
                dataKey="balance"
                stroke={BALANCE_COLOR}
                strokeWidth={2.5}
                fill="url(#colorBalance)"
                dot={{ r: 4, fill: BALANCE_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: BALANCE_COLOR, strokeWidth: 0 }}
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
            <ReferenceLine y={0} stroke="rgba(113,113,122,0.3)" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && (
              <Bar dataKey="income" fill={INCOME_COLOR} opacity={0.6} name="income" radius={[4, 4, 0, 0]} />
            )}
            {showExpense && (
              <Bar dataKey="expense" fill={EXPENSE_COLOR} opacity={0.6} name="expense" radius={[4, 4, 0, 0]} />
            )}
            {showBalance && (
              <Line
                type="monotone"
                dataKey="balance"
                stroke={BALANCE_COLOR}
                strokeWidth={2.5}
                dot={{ fill: BALANCE_COLOR, r: 3, strokeWidth: 0 }}
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
            <ReferenceLine y={0} stroke="rgba(113,113,122,0.3)" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && <Bar dataKey="income" fill={INCOME_COLOR} name="income" radius={[4, 4, 0, 0]} />}
            {showExpense && <Bar dataKey="expense" fill={EXPENSE_COLOR} name="expense" radius={[4, 4, 0, 0]} />}
            {showBalance && <Bar dataKey="balance" fill={BALANCE_COLOR} name="balance" radius={[4, 4, 0, 0]} />}
          </BarChart>
        )
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridProps} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(113,113,122,0.3)" strokeDasharray="3 3" strokeWidth={1} />
            
            {showIncome && (
              <Line
                type="monotone"
                dataKey="income"
                stroke={INCOME_COLOR}
                strokeWidth={2}
                dot={false}
                name="income"
              />
            )}
            {showExpense && (
              <Line
                type="monotone"
                dataKey="expense"
                stroke={EXPENSE_COLOR}
                strokeWidth={2}
                dot={false}
                name="expense"
              />
            )}
            {showBalance && (
              <Line
                type="monotone"
                dataKey="balance"
                stroke={BALANCE_COLOR}
                strokeWidth={2.5}
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
        <div className="flex items-center justify-center py-16 gap-2 text-sm text-zinc-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-400" />
          Chargement des donnees...
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
          description={`Aucune transaction trouvee pour ${selectedYear}. Ajoutez des transactions ou changez l'annee dans la sidebar.`}
          className="h-[400px]"
          action={
            <div className="flex flex-col items-center gap-8">
              {onAddTransaction && (
                <Button onClick={onAddTransaction} variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une transaction
                </Button>
              )}
              <ToggleGroup
                options={[
                  { value: 'month', label: 'Mois' },
                  { value: 'quarter', label: 'Trim.' },
                  { value: 'year', label: 'Annee' },
                ]}
                value={period}
                onChange={(v) => onPeriodChange(v as PeriodType)}
              />
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Evolution de la tresorerie - card unique */}
      <Card variant="outline">
        <CardContent className="p-4 space-y-4">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            Evolution de la tresorerie
            <div className="group/icon relative">
              <Info size={14} className="cursor-help text-zinc-400" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                  Graphique de l&apos;evolution du solde, des entrees et des sorties sur la periode selectionnee.
                </div>
              </div>
            </div>
          </h4>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtres Solde / Entrees / Sorties */}
            <ToggleGroup
              options={[
                { value: 'balance', label: 'Solde', dot: BALANCE_COLOR },
                { value: 'income', label: 'Entrees', dot: INCOME_COLOR },
                { value: 'expense', label: 'Sorties', dot: EXPENSE_COLOR },
              ]}
              values={[
                ...(showBalance ? ['balance'] : []),
                ...(showIncome ? ['income'] : []),
                ...(showExpense ? ['expense'] : []),
              ]}
              onChange={(vals) => {
                setShowBalance((vals as string[]).includes('balance'))
                setShowIncome((vals as string[]).includes('income'))
                setShowExpense((vals as string[]).includes('expense'))
              }}
              multiple
            />

            {/* Filtre periode */}
            <ToggleGroup
              options={[
                { value: 'month', label: 'Mois' },
                { value: 'quarter', label: 'Trim.' },
                { value: 'year', label: 'Annee' },
              ]}
              value={period}
              onChange={(v) => onPeriodChange(v as PeriodType)}
            />

            {/* Type de graphique */}
            <ToggleGroup
              options={[
                { value: 'area', label: 'Area' },
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'composed', label: 'Composed' },
              ]}
              value={chartType}
              onChange={(v) => setChartType(v as ChartType)}
            />
            
            <Button variant="outline" size="sm">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="outline">
            <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="group/icon relative">
                <Wallet size={18} className="cursor-help" />
                <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                  <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                    Solde de tresorerie a la fin de la periode selectionnee.
                  </div>
                </div>
              </div>
              <span className="text-xs">Solde actuel</span>
            </div>
            <p className={cn('text-xl font-bold tabular-nums', stats.current >= 0 ? 'text-green-500' : 'text-red-500')}>
              {formatCurrency(stats.current)}
            </p>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="group/icon relative">
                {trend >= 0 ? <TrendingUp size={18} className="cursor-help" /> : <TrendingDown size={18} className="cursor-help" />}
                <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                  <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                    Evolution en pourcentage du solde entre le debut et la fin de la periode.
                  </div>
                </div>
              </div>
              <span className="text-xs">Tendance</span>
            </div>
            <p className={cn('text-xl font-bold tabular-nums', trend >= 0 ? 'text-green-500' : 'text-red-500')}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </p>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="group/icon relative">
                <Activity size={18} className="cursor-help" />
                <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                  <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                    Solde moyen calcule sur toute la periode.
                  </div>
                </div>
              </div>
              <span className="text-xs">Moy. periode</span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {formatCurrency(stats.avg)}
            </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={280}>
          {renderChart()}
        </ResponsiveContainer>

        {/* Alert */}
        {stats.current < 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-500">Tresorerie negative</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Votre solde est actuellement negatif. Verifiez vos previsions et ajustez vos depenses.
              </p>
            </div>
          </div>
        )}

        {/* Secondary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="text-xs">Total entrees</span>
            <div className="group/icon relative">
              <Info size={12} className="cursor-help" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                  Somme de toutes les entrees d&apos;argent sur la periode.
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums text-green-500">
            +{formatCurrency(stats.totalIncome)}
          </p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="text-xs">Total sorties</span>
            <div className="group/icon relative">
              <Info size={12} className="cursor-help" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                  Somme de toutes les sorties d&apos;argent sur la periode.
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums text-red-500">
            -{formatCurrency(stats.totalExpense)}
          </p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="text-xs">Maximum</span>
            <div className="group/icon relative">
              <Info size={12} className="cursor-help" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                  Solde maximum atteint sur la periode.
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums">
            {formatCurrency(stats.max)}
          </p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="text-xs">Minimum</span>
            <div className="group/icon relative">
              <Info size={12} className="cursor-help" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                  Solde minimum atteint sur la periode.
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm font-bold tabular-nums">
            {formatCurrency(stats.min)}
          </p>
          </CardContent>
        </Card>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
