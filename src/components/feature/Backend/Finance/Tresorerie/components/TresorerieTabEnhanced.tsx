'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Button } from '@/components/ui/atoms'
import { Card, CardContent } from '@/components/ui/molecules'
import { Plus, TrendingUp, Zap, Wallet, ArrowUpRight, ArrowDownRight, PieChart, CircleDollarSign, Users } from 'lucide-react'
import { NewForecastModal } from '../modals'
import { getTreasuryForecasts } from '@/lib/stubs/supabase-stubs'
import type { TreasuryForecast } from '@/types/finance'
import { TreasuryChartEnhanced, MonthlyComparisonCard, ForecastTimelineCard, CompactKPICard } from './'
import { LoadingState, EmptyState } from '@/components/feature/Backend/Finance/shared/components'
import { safePadStart } from '@/lib/utils'

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
  refreshTrigger?: number
  onAddTransaction?: () => void
}

export default function TresorerieTabEnhanced({ refreshTrigger, onAddTransaction }: TresorerieTabEnhancedProps) {
  const [showNewForecastModal, setShowNewForecastModal] = useState(false)
  const [forecasts, setForecasts] = useState<TreasuryForecast[]>([])
  const [treasuryData, setTreasuryData] = useState<any[]>([])
  const [kpisData, setKpisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('year')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadAllData()
  }, [period, selectedYear, refreshTrigger])

  async function loadAllData() {
    try {
      setLoading(true)
      setChartLoading(true)
      console.log(`Chargement des donnees de tresorerie pour l'annee ${selectedYear}`)
      
      const [forecastsData, treasuryEvolution, kpis] = await Promise.all([
        getTreasuryForecasts(),
        getTreasuryEvolution(period, selectedYear),
        financeDataService.getFinanceKPIs(),
      ])
      
      console.log(`Donnees chargees:`, {
        forecasts: forecastsData?.length || 0,
        treasuryPoints: treasuryEvolution?.length || 0,
        kpis: kpis ? '✓' : '✗'
      })
      
      setForecasts(forecastsData || [])
      setTreasuryData(treasuryEvolution || [])
      setKpisData(kpis)
    } catch (error) {
      console.error('Erreur lors du chargement des donnees:', error)
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

  // Filtrer les previsions pour les categories
  const upcomingForecasts = forecasts
    .filter(f => new Date(f.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  if (loading) {
    return <LoadingState message="Chargement des donnees de tresorerie..." className="h-96" />
  }

  return (
    <div className="space-y-4">
      {/* Section 1 : KPIs compacts en 6 colonnes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <CompactKPICard
          label="Tresorerie"
          value={kpisData?.currentBalance || 0}
          unit="EUR"
          icon={Wallet}
        />
        
        <CompactKPICard
          label="Revenus mois"
          value={kpisData?.monthlyIncome || 0}
          unit="EUR"
          icon={ArrowUpRight}
          trend={kpisData?.incomeChange}
          trendLabel="vs M-1"
        />
        
        <CompactKPICard
          label="Depenses mois"
          value={kpisData?.monthlyExpenses || 0}
          unit="EUR"
          icon={ArrowDownRight}
          trend={kpisData?.expensesChange}
          trendLabel="vs M-1"
        />
        
        <CompactKPICard
          label="Flux net"
          value={(kpisData?.monthlyIncome || 0) - (kpisData?.monthlyExpenses || 0)}
          unit="EUR"
          icon={TrendingUp}
        />
        
        <CompactKPICard
          label="Budget restant"
          value={kpisData?.remainingBudget || 0}
          unit="EUR"
          icon={PieChart}
        />
        
        <CompactKPICard
          label="Adhesions"
          value={kpisData?.membershipsCount || 0}
          unit="memb."
          icon={Users}
        />
      </div>

      {/* Section 2 : Graphique principal ameliore */}
      <section>
        <TreasuryChartEnhanced
          data={chartData}
          loading={chartLoading}
          period={period}
          selectedYear={selectedYear}
          onPeriodChange={setPeriod}
          onYearChange={setSelectedYear}
          onAddTransaction={onAddTransaction}
        />
      </section>

      {/* Section 3 : Comparaison mensuelle */}
      <MonthlyComparisonCard
        currentMonth={monthlyComparison.current}
        previousMonth={monthlyComparison.previous}
      />

      {/* Section 4 : Previsions avec timeline */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 mt-8">
          <h3 className="font-heading text-2xl font-bold uppercase">
            Previsions a venir
          </h3>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">
              {upcomingForecasts.length} prevision{upcomingForecasts.length > 1 ? 's' : ''}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewForecastModal(true)}
              className="bg-purple-500 hover:bg-purple-600 border-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle prevision
            </Button>
          </div>
        </div>
        
        {upcomingForecasts.length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              icon={TrendingUp}
              title="Aucune prevision a venir"
              description="Creez des previsions pour anticiper les mouvements de tresorerie."
            />
            
            <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400 uppercase mb-1">
                    Conseil
                  </h4>
                  <p className="text-sm text-amber-600 dark:text-amber-500/90">
                    Creez des previsions pour anticiper les entrees et sorties d'argent et mieux gerer votre tresorerie.
                    Cela vous aidera a eviter les mauvaises surprises.
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewForecastModal(true)}
                      className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/30"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Ajouter une prevision
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingForecasts.map((forecast) => (
              <ForecastTimelineCard
                key={forecast.id}
                forecast={forecast}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal Nouvelle Prevision */}
      <NewForecastModal
        isOpen={showNewForecastModal}
        onClose={() => setShowNewForecastModal(false)}
        onSuccess={loadAllData}
      />
    </div>
  )
}

