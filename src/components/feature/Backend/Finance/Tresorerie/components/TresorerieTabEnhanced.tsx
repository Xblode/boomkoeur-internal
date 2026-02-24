'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Button } from '@/components/ui/atoms'
import { SectionHeader, Card, CardContent } from '@/components/ui/molecules'
import { Plus, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react'
import { NewForecastModal } from '../modals'
import { getTreasuryForecasts } from '@/lib/supabase/finance'
import type { TreasuryForecast } from '@/types/finance'
import { TreasuryChartEnhanced, MonthlyComparisonCard, ForecastTimelineCard } from './'
import { LoadingState, EmptyState } from '@/components/feature/Backend/Finance/shared/components'
import { safePadStart, cn, getErrorMessage } from '@/lib/utils'

type PeriodType = 'month' | 'quarter' | 'year'

/**
 * Calcule l'evolution de la tresorerie basee sur les transactions
 */
const getTreasuryEvolution = async (period: PeriodType, year: number) => {
  try {
    // Recuperer toutes les transactions de l'annee
    const transactions = await financeDataService.getTransactions(year)
    
    if (!transactions || transactions.length === 0) {
      console.log('Aucune transaction trouvee pour l\'annee', year)
      return []
    }
    
    console.log(`Calcul de l'evolution de la tresorerie avec ${transactions.length} transactions`)
    
    // Recuperer le solde initial des comptes bancaires
    const bankAccounts = await financeDataService.getBankAccounts()
    const initialBalance = bankAccounts.reduce((sum, acc) => sum + (acc.initial_balance || 0), 0)
    
    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // Grouper par periode
    const dataByPeriod: Record<string, { date: string; income: number; expense: number; balance: number }> = {}
    let cumulativeBalance = initialBalance
    
    sortedTransactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      
      // Verifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn(`Date invalide pour la transaction ${transaction.id}:`, transaction.date)
        return // Ignorer cette transaction
      }
      
      let periodKey: string
      
      // Obtenir le mois et l'annee de maniere securisee
      const month = date.getMonth() + 1 // getMonth() retourne 0-11
      const year = date.getFullYear()
      
      // Generer la cle de periode selon le type
      switch (period) {
        case 'month':
          periodKey = `${year}-${safePadStart(month, 2, '0')}-01`
          break
        case 'quarter':
          const quarter = Math.floor((month - 1) / 3) + 1
          periodKey = `${year}-Q${quarter}`
          break
        case 'year':
        default:
          periodKey = `${year}-${safePadStart(month, 2, '0')}-01`
          break
      }
      
      // Initialiser la periode si elle n'existe pas
      if (!dataByPeriod[periodKey]) {
        dataByPeriod[periodKey] = {
          date: periodKey,
          income: 0,
          expense: 0,
          balance: cumulativeBalance,
        }
      }
      
      // Ajouter les montants
      if (transaction.type === 'income') {
        dataByPeriod[periodKey].income += transaction.amount
        cumulativeBalance += transaction.amount
      } else {
        dataByPeriod[periodKey].expense += transaction.amount
        cumulativeBalance -= transaction.amount
      }
      
      dataByPeriod[periodKey].balance = cumulativeBalance
    })
    
    // Convertir en tableau et trier
    const result = Object.values(dataByPeriod).sort((a, b) => a.date.localeCompare(b.date))
    
    console.log(`${result.length} periodes calculees pour le graphique`)
    
    return result
  } catch (error) {
    console.error('Erreur lors du calcul de l\'evolution de la tresorerie:', error)
    return []
  }
}

interface TresorerieTabEnhancedProps {
  selectedYear: number
  refreshTrigger?: number
  onAddTransaction?: () => void
  onError?: (error: string | null) => void
}

export default function TresorerieTabEnhanced({ selectedYear, refreshTrigger, onAddTransaction, onError }: TresorerieTabEnhancedProps) {
  const [showNewForecastModal, setShowNewForecastModal] = useState(false)
  const [forecasts, setForecasts] = useState<TreasuryForecast[]>([])
  const [treasuryData, setTreasuryData] = useState<any[]>([])
  const [kpisData, setKpisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('year')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
  }, [period, selectedYear, refreshTrigger])

  async function loadAllData() {
    try {
      setLoading(true)
      setChartLoading(true)
      setError(null)
      onError?.(null)
      console.log(`Chargement des donnees de tresorerie pour l'annee ${selectedYear}`)
      
      const [forecastsData, treasuryEvolution, kpis] = await Promise.all([
        getTreasuryForecasts(),
        getTreasuryEvolution(period, selectedYear),
        financeDataService.getFinanceKPIs(selectedYear),
      ])
      
      console.log(`Donnees chargees:`, {
        forecasts: forecastsData?.length || 0,
        treasuryPoints: treasuryEvolution?.length || 0,
        kpis: kpis ? '✓' : '✗'
      })
      
      setForecasts(forecastsData || [])
      setTreasuryData(treasuryEvolution || [])
      setKpisData(kpis)
    } catch (err) {
      const msg = getErrorMessage(err)
      const errorMsg = msg || 'Erreur lors du chargement des données de trésorerie.'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Erreur lors du chargement des donnees:', err)
    } finally {
      setLoading(false)
      setChartLoading(false)
    }
  }

  // Formater les donnees pour le graphique
  const formatChartData = () => {
    if (treasuryData.length === 0) return []

    // Si on a plus de 90 points, on groupe par semaine
    if (treasuryData.length > 90) {
      const weeklyData: Record<string, { date: string; balance: number; income: number; expense: number }> = {}
      
      treasuryData.forEach((day) => {
        const date = new Date(day.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: weekKey,
            balance: day.balance,
            income: 0,
            expense: 0,
          }
        }
        
        weeklyData[weekKey].income += day.income
        weeklyData[weekKey].expense += day.expense
        weeklyData[weekKey].balance = day.balance
      })
      
      return Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date))
    }

    return treasuryData
  }

  const chartData = formatChartData()

  // Calculer les comparaisons mensuelles
  const getMonthlyComparison = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const currentMonthData = treasuryData.filter(d => {
      const date = new Date(d.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const previousMonthData = treasuryData.filter(d => {
      const date = new Date(d.date)
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear
    })

    return {
      current: {
        month: now.toLocaleDateString('fr-FR', { month: 'long' }),
        income: currentMonthData.reduce((sum, d) => sum + d.income, 0),
        expense: currentMonthData.reduce((sum, d) => sum + d.expense, 0),
        balance: currentMonthData.length > 0 ? currentMonthData[currentMonthData.length - 1].balance : 0,
      },
      previous: {
        month: new Date(previousYear, previousMonth).toLocaleDateString('fr-FR', { month: 'long' }),
        income: previousMonthData.reduce((sum, d) => sum + d.income, 0),
        expense: previousMonthData.reduce((sum, d) => sum + d.expense, 0),
        balance: previousMonthData.length > 0 ? previousMonthData[previousMonthData.length - 1].balance : 0,
      },
    }
  }

  const monthlyComparison = getMonthlyComparison()

  const formatCurrency = (v: number) => `${(v ?? 0).toLocaleString('fr-FR')} EUR`
  const fluxNet = (kpisData?.monthlyRevenue ?? 0) - (kpisData?.monthlyExpense ?? 0)

  const tresorerieMetadata = [
    [
      { icon: Wallet, label: 'Trésorerie', value: <span className="text-sm font-semibold tabular-nums">{formatCurrency(kpisData?.currentBalance)}</span> },
      { icon: ArrowUpRight, label: 'Revenus mois', value: <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(kpisData?.monthlyRevenue)}</span> },
      { icon: ArrowDownRight, label: 'Dépenses mois', value: <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">{formatCurrency(kpisData?.monthlyExpense)}</span> },
    ],
    [
      { icon: TrendingUp, label: 'Flux net', value: <span className={cn('text-sm font-semibold tabular-nums', fluxNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>{fluxNet >= 0 ? '+' : ''}{formatCurrency(fluxNet)}</span> },
      { icon: PieChart, label: 'Budget restant', value: <span className="text-sm font-semibold tabular-nums">{formatCurrency(kpisData?.remainingBudget)}</span> },
    ],
  ]

  // Filtrer les previsions pour les categories
  const upcomingForecasts = forecasts
    .filter(f => new Date(f.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  if (loading) {
    return <LoadingState message="Chargement des donnees de tresorerie..." className="h-96" />
  }

  return (
    <div className="space-y-6">
      {/* En-tête : titre + KPIs en métadonnées */}
      <SectionHeader
        title="Trésorerie"
        icon={<Wallet size={28} />}
        subtitle="Vue d'ensemble de votre trésorerie, graphique et prévisions."
        metadata={tresorerieMetadata}
        gridColumns="130px 1fr 130px 1fr 130px 1fr"
      />

      {/* Section 2 : Graphique principal ameliore */}
      <section>
        <TreasuryChartEnhanced
          data={chartData}
          loading={chartLoading}
          period={period}
          selectedYear={selectedYear}
          onPeriodChange={setPeriod}
          onAddTransaction={onAddTransaction}
        />
      </section>

      {/* Section 3 : Comparaison mensuelle */}
      <MonthlyComparisonCard
        currentMonth={monthlyComparison.current}
        previousMonth={monthlyComparison.previous}
      />

      {/* Section 4 : Previsions avec timeline */}
      {upcomingForecasts.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Aucune prevision a venir"
          description="Creez des previsions pour anticiper les mouvements de tresorerie et mieux gerer votre cash-flow."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewForecastModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle prevision
            </Button>
          }
          className="h-[300px]"
        />
      ) : (
        <Card variant="outline">
          <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h4 className="text-sm font-semibold">
              Previsions a venir
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">
                {upcomingForecasts.length} prevision{upcomingForecasts.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowNewForecastModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle prevision
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingForecasts.map((forecast) => (
              <ForecastTimelineCard
                key={forecast.id}
                forecast={forecast}
              />
            ))}
          </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Nouvelle Prevision */}
      <NewForecastModal
        isOpen={showNewForecastModal}
        onClose={() => setShowNewForecastModal(false)}
        onSuccess={loadAllData}
      />
    </div>
  )
}

