'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Button } from '@/components/ui/atoms'
import { Plus } from 'lucide-react'
import { NewForecastModal } from '../modals'
import { getTreasuryForecasts } from '@/lib/stubs/supabase-stubs'
import type { TreasuryForecast } from '@/types/finance'
import { TreasuryChart, TreasuryChartHeader, ForecastsGrid } from './'
import { SectionHeader } from '@/components/feature/Backend/Finance/shared/components'

type PeriodType = 'month' | 'quarter' | 'year'

// TODO: Implementer getTreasuryEvolution
const getTreasuryEvolution = async (period: PeriodType, year: number) => {
  console.warn('getTreasuryEvolution: stub non implemente')
  return []
}

interface TresorerieTabProps {
  refreshTrigger?: number
}

export default function TresorerieTab({ refreshTrigger }: TresorerieTabProps) {
  const [showNewForecastModal, setShowNewForecastModal] = useState(false)
  const [forecasts, setForecasts] = useState<TreasuryForecast[]>([])
  const [treasuryData, setTreasuryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('year')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadForecasts()
    loadTreasuryEvolution()
  }, [period, selectedYear, refreshTrigger])

  async function loadForecasts() {
    try {
      setLoading(true)
      const data = await getTreasuryForecasts()
      setForecasts(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des previsions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadTreasuryEvolution() {
    try {
      setChartLoading(true)
      const data = await getTreasuryEvolution(period, selectedYear)
      setTreasuryData(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement de l\'evolution:', error)
    } finally {
      setChartLoading(false)
    }
  }

  // Formater les donnees pour le graphique (grouper par semaine si trop de points)
  const formatChartData = () => {
    if (treasuryData.length === 0) return []

    // Si on a plus de 90 points, on groupe par semaine
    if (treasuryData.length > 90) {
      const weeklyData: Record<string, { date: string; balance: number; income: number; expense: number }> = {}
      
      treasuryData.forEach((day) => {
        const date = new Date(day.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay()) // Debut de semaine (dimanche)
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
        weeklyData[weekKey].balance = day.balance // Prendre le dernier solde de la semaine
      })
      
      return Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date))
    }

    return treasuryData
  }

  const chartData = formatChartData()

  if (loading && forecasts.length === 0) {
    return (
      <div className="space-y-8">
        {/* Section 1 : Graphique d'evolution Skeleton */}
        <section className="space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
              <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Chart Skeleton */}
          <div className="h-80 bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="h-full flex items-end justify-between gap-2">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-t animate-pulse"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 : Previsions de tresorerie Skeleton */}
        <section className="space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="h-6 w-56 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
            <div className="h-9 w-44 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                </div>
                <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 1 : Graphique d'evolution */}
      <section>
        <TreasuryChartHeader
          period={period}
          selectedYear={selectedYear}
          onPeriodChange={setPeriod}
          onYearChange={setSelectedYear}
        />
        <TreasuryChart
          data={chartData}
          loading={chartLoading}
          period={period}
        />
      </section>

      {/* Section 2 : Previsions de tresorerie */}
      <section>
        <SectionHeader
          icon="🔮"
          title="Previsions de tresorerie"
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowNewForecastModal(true)}
              className="bg-purple-500 hover:bg-purple-600 border-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle prevision
            </Button>
          }
        />
        <ForecastsGrid
          forecasts={forecasts}
          loading={loading}
          maxVisible={6}
        />
      </section>

      {/* Modal Nouvelle Prevision */}
      <NewForecastModal
        isOpen={showNewForecastModal}
        onClose={() => setShowNewForecastModal(false)}
        onSuccess={loadForecasts}
      />
    </div>
  )
}
