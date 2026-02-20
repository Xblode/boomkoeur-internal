'use client'

import { useState, useMemo, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'
import { Input } from '@/components/ui/atoms'
import { Badge } from '@/components/ui/atoms'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Calendar, Package } from 'lucide-react'
import type { BudgetProject } from '@/types/finance'

interface LinkProjectModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  onLink: (projectId: string) => Promise<void>
}

export function LinkProjectModal({ isOpen, onClose, transactionId, onLink }: LinkProjectModalProps) {
  const [allProjects, setAllProjects] = useState<BudgetProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadProjects()
    }
  }, [isOpen])

  async function loadProjects() {
    try {
      setIsLoading(true)
      const projects = await financeDataService.getBudgetProjects()
      setAllProjects(projects || [])
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer les projets
  const filteredProjects = useMemo(() => {
    let projects = allProjects

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      projects = projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.type?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query)
      )
    }

    // Trier par date de creation (plus recent en premier)
    projects.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    return projects
  }, [allProjects, searchQuery])

  const handleLink = async (projectId: string) => {
    try {
      await onLink(projectId)
    } catch (error) {
      // Erreur geree par le parent
    }
  }

  const getProjectTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      merchandising: '🛍️ Merchandising',
      investment: '💰 Investissement',
      communication: '📢 Communication',
      other: '📦 Autre',
    }
    return labels[type || 'other'] || '📦 Projet'
  }

  const getProjectStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Termine',
      cancelled: 'Annule',
    }
    return labels[status || 'draft'] || 'Brouillon'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lier a un projet"
      size="lg"
      scrollable
    >
      <div className="space-y-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-label uppercase mb-2">
            Rechercher
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Titre, type, notes..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des projets */}
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Chargement...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>Aucun projet trouve</p>
            {searchQuery && (
              <p className="text-xs mt-2">Essayez de modifier votre recherche</p>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 border border-border-custom rounded hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-heading font-bold text-sm">{project.title}</h4>
                      <Badge
                        variant="default"
                        className={
                          project.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : project.status === 'completed'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : project.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }
                      >
                        {getProjectStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                      <Package className="w-3 h-3" />
                      <span>{getProjectTypeLabel(project.type)}</span>
                    </div>
                    {project.start_date && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(project.start_date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLink(project.id)}
                  >
                    Lier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 justify-end mt-6">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </Modal>
  )
}

