'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Card, CardContent, CardHeader } from '@/components/ui/molecules'
import { AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: Implementer getBudgetAlerts et BudgetAlert
type BudgetAlert = {
  id: string
  type: 'over_budget' | 'warning' | 'under_consumption'
  message: string
  category: string
  allocated: number
  spent: number
}
const getBudgetAlerts = async () => [] as BudgetAlert[]

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    try {
      setLoading(true)
      const data = await getBudgetAlerts()
      setAlerts(data)
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (alerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'over_budget':
        return <TrendingUp className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'under_consumption':
        return <TrendingDown className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-zinc-500" />
    }
  }

  const getAlertColor = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'over_budget':
        return 'bg-red-500/10 border-red-500/50'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/50'
      case 'under_consumption':
        return 'bg-blue-500/10 border-blue-500/50'
      default:
        return 'bg-gray-500/10 border-gray-500/50'
    }
  }

  return (
    <Card className="border-accent/50">
      <CardHeader className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />
        <h2 className="font-heading text-xl font-bold uppercase">Alertes budgetaires</h2>
        <span className="ml-auto px-3 py-1 bg-accent/20 text-zinc-900 dark:text-zinc-50 rounded-full text-sm font-bold">
          {alerts.length}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'p-4 border-2 rounded-lg flex items-start gap-4',
                getAlertColor(alert.type)
              )}
            >
              <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold mb-1">{alert.category}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{alert.message}</div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>
                    Budget: {alert.allocated.toLocaleString('fr-FR')} EUR
                  </span>
                  <span>
                    Dépensé: {alert.spent.toLocaleString('fr-FR')} EUR
                  </span>
                  <span className="font-bold text-foreground">
                    {alert.allocated > 0 ? ((alert.spent / alert.allocated) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

