'use client'

import { useEffect, useState } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Wallet, TrendingUp, TrendingDown, PieChart, CircleDollarSign, Users } from 'lucide-react'
import { KPIGrid } from './'

interface FinanceKPIsProps {
  refreshTrigger?: number
}

function FinanceKPIs({ refreshTrigger }: FinanceKPIsProps) {
  const [kpisData, setKpisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadKPIs()
  }, [refreshTrigger])

  async function loadKPIs() {
    try {
      setLoading(true)
      const data = await financeDataService.getFinanceKPIs()
      setKpisData(data)
    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    {
      id: 'current-balance',
      label: 'Tresorerie actuelle',
      value: kpisData?.currentBalance?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: Wallet,
      color: kpisData?.currentBalance >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: kpisData?.currentBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      subtext: `${kpisData?.monthlyIncome?.toLocaleString('fr-FR') || 0}EUR ce mois`,
    },
    {
      id: 'monthly-income',
      label: 'Revenus du mois',
      value: kpisData?.monthlyIncome?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      subtext: kpisData?.incomeChange !== undefined 
        ? `${kpisData.incomeChange >= 0 ? '+' : ''}${kpisData.incomeChange.toFixed(1)}% vs mois precedent`
        : 'Mois en cours',
      change: kpisData?.incomeChange,
    },
    {
      id: 'monthly-expenses',
      label: 'Depenses du mois',
      value: kpisData?.monthlyExpenses?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      subtext: kpisData?.expensesChange !== undefined 
        ? `${kpisData.expensesChange >= 0 ? '+' : ''}${kpisData.expensesChange.toFixed(1)}% vs mois precedent`
        : 'Mois en cours',
      change: kpisData?.expensesChange,
    },
    {
      id: 'remaining-budget',
      label: `Budget restant ${new Date().getFullYear()}`,
      value: kpisData?.remainingBudget?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: PieChart,
      color: kpisData?.remainingBudget !== undefined && kpisData.remainingBudget > 0 ? 'text-blue-500' : 'text-gray-500',
      bgColor: kpisData?.remainingBudget !== undefined && kpisData.remainingBudget > 0 ? 'bg-blue-500/10' : 'bg-gray-500/10',
      subtext: kpisData?.totalBudget ? `Budget total: ${kpisData.totalBudget.toLocaleString('fr-FR')}EUR` : 'Aucun budget defini',
    },
    {
      id: 'subsidies',
      label: 'Subventions obtenues',
      value: kpisData?.subsidies?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: CircleDollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtext: 'Objectif: 30KEUR',
    },
    {
      id: 'memberships',
      label: 'Adhesions 2025',
      value: kpisData?.membershipsCount?.toString() || '0',
      unit: 'membres',
      icon: Users,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      subtext: `${kpisData?.memberships?.toLocaleString('fr-FR') || 0}EUR • Obj: 200`,
    },
  ]

  return <KPIGrid kpis={kpis} loading={loading} columns={6} />
}

export default FinanceKPIs
export { FinanceKPIs }
