'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Card, CardContent, CardHeader } from '@/components/ui/molecules'
import { Button } from '@/components/ui/atoms'
import { Plus, TrendingUp, DollarSign, Calendar as CalendarIcon, Package } from 'lucide-react'
import type { EventBudgetSummary, BudgetProjectSummary } from '@/types/finance'

// TODO: Implementer ces fonctions ou les connecter aux hooks du projet
const getAllEventsWithBudgets = async ({ year }: { year: number }) => []
const getAllProjectsWithBudgets = async ({ year }: { year: number }) => []
import { LoadingState, EmptyState, KPICard } from '@/components/feature/Backend/Finance/shared/components'
import EventBudgetCard from './EventBudgetCard'
import BudgetProjectCard from './BudgetProjectCard'
import CreateEventBudgetModal from '../modals/CreateEventBudgetModal'
import CreateBudgetProjectModal from '../modals/CreateBudgetProjectModal'
import ManageBudgetTemplatesModal from '../modals/ManageBudgetTemplatesModal'

type FilterStatus = 'all' | 'planned' | 'ongoing' | 'completed'
type ProjectFilterStatus = 'all' | 'draft' | 'active' | 'completed' | 'cancelled'

interface BudgetTabProps {
  selectedYear?: number
  filterStatus?: FilterStatus
  onCreateBudget?: (eventId: string) => void
  onEditProject?: (projectId: string) => void
  onCreateProject?: () => void
  onError?: (error: string | null) => void
  refreshTrigger?: number
}

export default function BudgetTab({ selectedYear: externalSelectedYear, filterStatus: externalFilterStatus, onCreateBudget, onEditProject, onCreateProject, onError, refreshTrigger }: BudgetTabProps) {
  const router = useRouter()
  const [internalSelectedYear, setInternalSelectedYear] = useState(new Date().getFullYear())
  const selectedYear = externalSelectedYear ?? internalSelectedYear
  const filterStatus = externalFilterStatus ?? 'all'
  const [projectFilterStatus, setProjectFilterStatus] = useState<ProjectFilterStatus>('all')
  const [events, setEvents] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedYear, refreshTrigger])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      onError?.(null)
      const [eventsData, projectsData] = await Promise.all([
        getAllEventsWithBudgets({ year: selectedYear }),
        financeDataService.getBudgetProjects({ year: selectedYear })
      ])
      setEvents(eventsData || [])
      setProjects(projectsData || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const errorMsg = msg || 'Erreur lors du chargement des donnees'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Erreur lors du chargement des donnees:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les evenements
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filtre par statut
      if (filterStatus !== 'all' && event.status !== filterStatus) {
        return false
      }

      return true
    })
  }, [events, filterStatus])

  // Filtrer les projets
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filtre par statut
      if (projectFilterStatus !== 'all' && project.status !== projectFilterStatus) {
        return false
      }

      return true
    })
  }, [projects, projectFilterStatus])

  // Calculer les KPIs globaux
  const globalKPIs = useMemo(() => {
    const eventsWithBudget = filteredEvents.filter(e => e.budget_summary?.budgets?.length > 0)
    
    return {
      totalEvents: filteredEvents.length,
      eventsWithBudget: eventsWithBudget.length,
      totalBudget: eventsWithBudget.reduce((sum, e) => 
        sum + (e.budget_summary?.total_revenue_allocated || 0) - (e.budget_summary?.total_expense_allocated || 0), 0
      ),
      totalActual: eventsWithBudget.reduce((sum, e) => 
        sum + (e.budget_summary?.result_actual || 0), 0
      ),
      totalRevenueAllocated: eventsWithBudget.reduce((sum, e) => 
        sum + (e.budget_summary?.total_revenue_allocated || 0), 0
      ),
      totalExpenseAllocated: eventsWithBudget.reduce((sum, e) => 
        sum + (e.budget_summary?.total_expense_allocated || 0), 0
      ),
    }
  }, [filteredEvents])

  const handleCreateBudget = (eventId: string) => {
    if (onCreateBudget) {
      onCreateBudget(eventId)
    }
  }

  const handleEditBudget = (eventId: string) => {
    if (onCreateBudget) {
      onCreateBudget(eventId)
    }
  }

  const handleEditProject = (projectId: string) => {
    if (onEditProject) {
      onEditProject(projectId)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des budgets..." className="h-96" />
  }

  return (
    <div className="space-y-6">
      {/* KPIs globaux */}
      {globalKPIs.eventsWithBudget > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Evenements avec budget"
            value={`${globalKPIs.eventsWithBudget} / ${globalKPIs.totalEvents}`}
            subtext="Evenements planifies"
            icon={CalendarIcon}
          />
          <KPICard
            label="Budget total prevu"
            value={`${globalKPIs.totalRevenueAllocated.toLocaleString('fr-FR')} EUR`}
            subtext="Revenus attendus"
            icon={TrendingUp}
          />
          <KPICard
            label="Charges prevues"
            value={`${globalKPIs.totalExpenseAllocated.toLocaleString('fr-FR')} EUR`}
            subtext="Depenses planifiees"
            icon={DollarSign}
          />
          <KPICard
            label="Resultat previsionnel"
            value={`${globalKPIs.totalBudget >= 0 ? '+' : ''}${globalKPIs.totalBudget.toLocaleString('fr-FR')} EUR`}
            subtext={`Reel: ${globalKPIs.totalActual >= 0 ? '+' : ''}${globalKPIs.totalActual.toLocaleString('fr-FR')} EUR`}
            icon={Package}
          />
        </div>
      )}

      {/* Liste des evenements */}
      <div>
        <h2 className="font-heading text-2xl font-bold uppercase mb-4">📅 Budgets evenements</h2>
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title={`Aucun evenement trouve pour ${selectedYear}`}
            description="Creez des evenements dans la page Evenements pour pouvoir gerer leurs budgets"
            className="min-h-[400px]"
            action={
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => router.push('/dashboard/events')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Creer un evenement
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <EventBudgetCard
                key={event.id}
                summary={event.budget_summary || {
                  event_id: event.id,
                  event_title: event.title,
                  event_date: event.date,
                  event_status: event.status,
                  total_revenue_allocated: 0,
                  total_revenue_actual: 0,
                  total_expense_allocated: 0,
                  total_expense_actual: 0,
                  result_allocated: 0,
                  result_actual: 0,
                  budgets: [],
                }}
                onEdit={() => handleEditBudget(event.id)}
                onCreateBudget={() => handleCreateBudget(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Liste des projets */}
      <div>
        <h2 className="font-heading text-2xl font-bold uppercase mb-4">📦 Budgets projets</h2>
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucun projet budgetaire"
            description="Creez un projet (merchandising, equipement, etc.) pour suivre son budget"
            className="min-h-[400px]"
            action={
              onCreateProject && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onCreateProject}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Creer un projet
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredProjects.map(project => (
              <BudgetProjectCard
                key={project.id}
                summary={project.budget_summary || {
                  project_id: project.id,
                  project_title: project.title,
                  project_type: project.type,
                  project_status: project.status,
                  total_revenue_allocated: 0,
                  total_revenue_actual: 0,
                  total_expense_allocated: 0,
                  total_expense_actual: 0,
                  result_allocated: 0,
                  result_actual: 0,
                  lines: [],
                }}
                onEdit={() => handleEditProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

