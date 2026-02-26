'use client'

import { Wallet, TrendingUp, TrendingDown, PieChart, CircleDollarSign, Users } from 'lucide-react'
import { PageAlert } from '@/components/ui/molecules'
import { KPIGrid } from './'
import { useFinanceKPIs } from '@/hooks'

interface FinanceKPIsProps {
  refreshTrigger?: number
  selectedYear?: number
}

function FinanceKPIs({ refreshTrigger, selectedYear }: FinanceKPIsProps) {
  const { kpis: kpisData, isLoading: loading, error: errorState, refetch } = useFinanceKPIs(selectedYear)
  const error = errorState?.message ?? null

  const isConfigError = error ? /relation.*does not exist|permission denied|JWT/i.test(error) : false
  const alertMessage = error
    ? isConfigError
      ? 'Base de données non configurée. Exécutez les migrations SQL dans Supabase (voir supabase/migrations/).'
      : error
    : null

  const kpis = [
    {
      id: 'current-balance',
      label: 'Tresorerie actuelle',
      value: kpisData?.currentBalance?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: Wallet,
      color: (kpisData?.currentBalance ?? 0) >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: (kpisData?.currentBalance ?? 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      subtext: `${kpisData?.monthlyRevenue?.toLocaleString('fr-FR') || 0}EUR ce mois`,
    },
    {
      id: 'monthly-income',
      label: 'Revenus du mois',
      value: kpisData?.monthlyRevenue?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      subtext: (kpisData as { incomeChange?: number })?.incomeChange !== undefined 
        ? `${((kpisData as { incomeChange?: number }).incomeChange ?? 0) >= 0 ? '+' : ''}${((kpisData as { incomeChange?: number }).incomeChange)!.toFixed(1)}% vs mois precedent`
        : 'Mois en cours',
      change: (kpisData as { incomeChange?: number })?.incomeChange,
    },
    {
      id: 'monthly-expenses',
      label: 'Depenses du mois',
      value: kpisData?.monthlyExpense?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      subtext: (kpisData as { expensesChange?: number })?.expensesChange !== undefined 
        ? `${((kpisData as { expensesChange?: number }).expensesChange ?? 0) >= 0 ? '+' : ''}${((kpisData as { expensesChange?: number }).expensesChange)!.toFixed(1)}% vs mois precedent`
        : 'Mois en cours',
      change: (kpisData as { expensesChange?: number })?.expensesChange,
    },
    {
      id: 'remaining-budget',
      label: `Budget restant ${new Date().getFullYear()}`,
      value: kpisData?.remainingBudget?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: PieChart,
      color: kpisData?.remainingBudget !== undefined && kpisData.remainingBudget > 0 ? 'text-blue-500' : 'text-gray-500',
      bgColor: kpisData?.remainingBudget !== undefined && kpisData.remainingBudget > 0 ? 'bg-blue-500/10' : 'bg-gray-500/10',
      subtext: (kpisData as { totalBudget?: number })?.totalBudget ? `Budget total: ${(kpisData as { totalBudget?: number }).totalBudget!.toLocaleString('fr-FR')}EUR` : 'Aucun budget defini',
    },
    {
      id: 'subsidies',
      label: 'Subventions obtenues',
      value: kpisData?.subsidy?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: CircleDollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtext: 'Objectif: 30KEUR',
    },
    {
      id: 'memberships',
      label: 'Adhesions 2025',
      value: kpisData?.membership?.toLocaleString('fr-FR') || '0',
      unit: 'EUR',
      icon: Users,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      subtext: 'Mois en cours',
    },
  ]

  return (
    <>
      {alertMessage && (
        <PageAlert variant="error" message={alertMessage} onDismiss={() => refetch()} className="mb-4" />
      )}
      <KPIGrid kpis={kpis} loading={loading} columns={6} />
    </>
  )
}

export default FinanceKPIs
export { FinanceKPIs }
