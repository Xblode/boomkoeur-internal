import { useState } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Card, CardContent, CardHeader } from '@/components/ui/molecules'
import { Button } from '@/components/ui/atoms'
import { Badge } from '@/components/ui/atoms'
import { ChevronDown, ChevronUp, Edit, Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { EventBudgetSummary } from '@/types/finance'
import ProgressBar from './ProgressBar'

interface EventBudgetCardProps {
  summary: EventBudgetSummary
  onEdit?: () => void
  onCreateBudget?: () => void
}

type ScenarioMode = 'low' | 'medium' | 'high'

export default function EventBudgetCard({ summary, onEdit, onCreateBudget }: EventBudgetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>('medium')

  const hasBudget = summary.budgets && summary.budgets.length > 0
  
  // Recuperer les montants selon le scenario
  const getRevenueAllocated = () => {
    switch (scenarioMode) {
      case 'low': return summary.total_revenue_allocated_low || summary.total_revenue_allocated
      case 'high': return summary.total_revenue_allocated_high || summary.total_revenue_allocated
      default: return summary.total_revenue_allocated
    }
  }

  const getExpenseAllocated = () => {
    switch (scenarioMode) {
      case 'low': return summary.total_expense_allocated_low || summary.total_expense_allocated
      case 'high': return summary.total_expense_allocated_high || summary.total_expense_allocated
      default: return summary.total_expense_allocated
    }
  }

  const getResultAllocated = () => {
    switch (scenarioMode) {
      case 'low': return summary.result_allocated_low || summary.result_allocated
      case 'high': return summary.result_allocated_high || summary.result_allocated
      default: return summary.result_allocated
    }
  }

  const revenueAllocated = getRevenueAllocated()
  const expenseAllocated = getExpenseAllocated()
  const resultAllocated = getResultAllocated()
  
  const revenuePercentage = revenueAllocated > 0
    ? (summary.total_revenue_actual / revenueAllocated) * 100
    : 0

  const expensePercentage = expenseAllocated > 0
    ? (summary.total_expense_actual / expenseAllocated) * 100
    : 0

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'ongoing': return 'warning'
      case 'cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Termine'
      case 'ongoing': return 'En cours'
      case 'cancelled': return 'Annule'
      default: return 'Planifie'
    }
  }

  return (
    <Card className="hover:border-accent/50 transition-all">
      <CardHeader className="border-b-2 border-border-custom">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-heading text-xl font-bold uppercase">{summary.event_title}</h3>
              <Badge variant={getStatusVariant(summary.event_status)}>
                {getStatusLabel(summary.event_status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(summary.event_date).toLocaleDateString('fr-FR', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasBudget ? (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={onCreateBudget}>
                + Budget
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {!hasBudget ? (
          <div className="text-center py-6">
            <p className="text-zinc-500 mb-4">Aucun budget defini pour cet evenement</p>
            {summary.total_expense_actual > 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Coûts reels enregistres : <span className="font-bold text-red-400">
                  {summary.total_expense_actual.toLocaleString('fr-FR')} EUR
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selecteur de scenario */}
            <div className="flex items-center justify-center gap-2 bg-background-secondary border-2 border-border-custom rounded p-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wide mr-2">Scenario :</span>
              <Button
                variant={scenarioMode === 'low' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setScenarioMode('low')}
                className={`text-xs ${scenarioMode !== 'low' ? 'border-2 border-border-custom' : ''}`}
              >
                <TrendingDown className="w-3 h-3 mr-1" />
                Pessimiste
              </Button>
              <Button
                variant={scenarioMode === 'medium' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setScenarioMode('medium')}
                className={`text-xs ${scenarioMode !== 'medium' ? 'border-2 border-border-custom' : ''}`}
              >
                <Minus className="w-3 h-3 mr-1" />
                Realiste
              </Button>
              <Button
                variant={scenarioMode === 'high' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setScenarioMode('high')}
                className={`text-xs ${scenarioMode !== 'high' ? 'border-2 border-border-custom' : ''}`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Optimiste
              </Button>
            </div>

            {/* Resume */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenus */}
              <div className="bg-background-secondary border-2 border-border-custom rounded p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">💰 Revenus</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-green-400">
                    {summary.total_revenue_actual.toLocaleString('fr-FR')} EUR
                  </span>
                  <span className="text-sm text-zinc-500">
                    / {revenueAllocated.toLocaleString('fr-FR')} EUR
                  </span>
                </div>
                <ProgressBar
                  value={summary.total_revenue_actual}
                  max={revenueAllocated}
                  color={revenuePercentage >= 100 ? 'green' : revenuePercentage >= 80 ? 'yellow' : 'red'}
                  height="sm"
                  showPercentage={true}
                  className="mt-2"
                />
              </div>

              {/* Charges */}
              <div className="bg-background-secondary border-2 border-border-custom rounded p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">💸 Charges</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-red-400">
                    {summary.total_expense_actual.toLocaleString('fr-FR')} EUR
                  </span>
                  <span className="text-sm text-zinc-500">
                    / {expenseAllocated.toLocaleString('fr-FR')} EUR
                  </span>
                </div>
                <ProgressBar
                  value={summary.total_expense_actual}
                  max={expenseAllocated}
                  color={expensePercentage > 100 ? 'red' : expensePercentage > 80 ? 'yellow' : 'green'}
                  height="sm"
                  showPercentage={true}
                  className="mt-2"
                />
              </div>

              {/* Resultat */}
              <div className="bg-background-secondary border-2 border-border-custom rounded p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">📈 Resultat</p>
                <div className="space-y-1">
                  <div>
                    <span className="text-xs text-zinc-500">Prevu: </span>
                    <span className={`font-heading text-lg font-bold ${
                      resultAllocated >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {resultAllocated >= 0 ? '+' : ''}
                      {resultAllocated.toLocaleString('fr-FR')} EUR
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">Reel: </span>
                    <span className={`font-heading text-lg font-bold ${
                      summary.result_actual >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {summary.result_actual >= 0 ? '+' : ''}
                      {summary.result_actual.toLocaleString('fr-FR')} EUR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details (collapsible) */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full justify-between"
              >
                <span>Voir le detail</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {isExpanded && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenus detailles */}
                  <div className="space-y-2">
                    <h4 className="font-heading text-sm font-bold uppercase text-green-400 mb-2">
                      Revenus
                    </h4>
                    {summary.budgets
                      .filter(b => b.type === 'income')
                      .map(budget => {
                        const allocatedAmount = scenarioMode === 'low' 
                          ? (budget.allocated_amount_low || budget.allocated_amount)
                          : scenarioMode === 'high'
                          ? (budget.allocated_amount_high || budget.allocated_amount)
                          : budget.allocated_amount

                        const percentage = allocatedAmount > 0
                          ? ((budget.actual_amount || 0) / allocatedAmount) * 100
                          : 0
                        const icon = percentage >= 100 ? '✓' : percentage >= 80 ? '⚠' : '○'
                        
                        return (
                          <div key={budget.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <span>{icon}</span>
                                {budget.category}
                                {budget.category === 'Billetterie' && (
                                  <span className="text-xs bg-accent/20 text-zinc-900 dark:text-zinc-50 px-1.5 py-0.5 rounded">Auto</span>
                                )}
                              </span>
                              <span className="font-mono text-foreground">
                                {(budget.actual_amount || 0).toLocaleString('fr-FR')} / {allocatedAmount.toLocaleString('fr-FR')} EUR
                                <span className="text-xs text-zinc-500 ml-1">
                                  ({percentage.toFixed(0)}%)
                                </span>
                              </span>
                            </div>
                            {(budget.allocated_amount_low || budget.allocated_amount_high) && (
                              <div className="text-xs text-zinc-500 ml-6 flex gap-3">
                                {budget.allocated_amount_low && (
                                  <span>Min: {budget.allocated_amount_low.toLocaleString('fr-FR')}EUR</span>
                                )}
                                {budget.allocated_amount_high && (
                                  <span>Max: {budget.allocated_amount_high.toLocaleString('fr-FR')}EUR</span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>

                  {/* Charges detaillees */}
                  <div className="space-y-2">
                    <h4 className="font-heading text-sm font-bold uppercase text-red-400 mb-2">
                      Charges
                    </h4>
                    {summary.budgets
                      .filter(b => b.type === 'expense')
                      .map(budget => {
                        const allocatedAmount = scenarioMode === 'low' 
                          ? (budget.allocated_amount_low || budget.allocated_amount)
                          : scenarioMode === 'high'
                          ? (budget.allocated_amount_high || budget.allocated_amount)
                          : budget.allocated_amount

                        const percentage = allocatedAmount > 0
                          ? ((budget.actual_amount || 0) / allocatedAmount) * 100
                          : 0
                        const icon = percentage > 100 ? '❌' : percentage > 80 ? '⚠' : '✓'
                        
                        return (
                          <div key={budget.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                <span>{icon}</span>
                                {budget.category}
                              </span>
                              <span className="font-mono text-foreground">
                                {(budget.actual_amount || 0).toLocaleString('fr-FR')} / {allocatedAmount.toLocaleString('fr-FR')} EUR
                                <span className="text-xs text-zinc-500 ml-1">
                                  ({percentage.toFixed(0)}%)
                                </span>
                              </span>
                            </div>
                            {(budget.allocated_amount_low || budget.allocated_amount_high) && (
                              <div className="text-xs text-zinc-500 ml-6 flex gap-3">
                                {budget.allocated_amount_low && (
                                  <span>Min: {budget.allocated_amount_low.toLocaleString('fr-FR')}EUR</span>
                                )}
                                {budget.allocated_amount_high && (
                                  <span>Max: {budget.allocated_amount_high.toLocaleString('fr-FR')}EUR</span>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

