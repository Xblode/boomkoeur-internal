'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button, Input, Select } from '@/components/ui/atoms'
import { FormField } from '@/components/ui/molecules'
import { Plus, Trash2, Save, X } from 'lucide-react'
import type { BudgetProject, BudgetProjectLine } from '@/types/finance'

const PROJECT_TYPE_LABELS = {
  merchandising: 'Merchandising',
  equipment: 'Equipement',
  communication: 'Communication',
  infrastructure: 'Infrastructure',
  development: 'Developpement',
  other: 'Autre',
}

const PROJECT_STATUS_LABELS = {
  draft: 'Brouillon',
  active: 'Actif',
  completed: 'Termine',
  cancelled: 'Annule',
}

interface CreateBudgetProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId?: string | null
}

type BudgetLine = {
  id: string
  category: string
  type: 'income' | 'expense'
  allocated_amount: number
  notes?: string
}

export default function CreateBudgetProjectModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}: CreateBudgetProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'merchandising' as BudgetProject['type'],
    status: 'draft' as BudgetProject['status'],
    start_date: '',
    end_date: '',
    responsible: '',
    notes: '',
  })

  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([])

  useEffect(() => {
    if (isOpen) {
      if (projectId) {
        loadProject()
      } else {
        resetForm()
      }
    }
  }, [isOpen, projectId])

  async function loadProject() {
    if (!projectId) return

    try {
      setLoading(true)
      const project = await financeDataService.getBudgetProject(projectId)
      if (!project) {
        alert('Projet introuvable')
        return
      }
      const lines = await financeDataService.getProjectBudgetLines(projectId)

      setFormData({
        title: project.title,
        description: project.description || '',
        type: project.type,
        status: project.status,
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
        responsible: project.responsible || '',
        notes: project.notes || '',
      })

      setBudgetLines(lines.map(line => ({
        id: line.id,
        category: line.category,
        type: line.type,
        allocated_amount: line.allocated_amount,
        notes: line.notes,
      })))

      setIsEditMode(true)
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error)
      alert('Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      type: 'merchandising',
      status: 'draft',
      start_date: '',
      end_date: '',
      responsible: '',
      notes: '',
    })
    setBudgetLines([
      { id: crypto.randomUUID(), category: '', type: 'income', allocated_amount: 0 },
      { id: crypto.randomUUID(), category: '', type: 'expense', allocated_amount: 0 },
    ])
    setIsEditMode(false)
  }

  function addLine(type: 'income' | 'expense') {
    setBudgetLines([
      ...budgetLines,
      {
        id: crypto.randomUUID(),
        category: '',
        type,
        allocated_amount: 0,
      },
    ])
  }

  function updateLine(id: string, field: keyof BudgetLine, value: any) {
    setBudgetLines(budgetLines.map(line =>
      line.id === id ? { ...line, [field]: value } : line
    ))
  }

  function removeLine(id: string) {
    setBudgetLines(budgetLines.filter(line => line.id !== id))
  }

  async function handleSubmit() {
    if (!formData.title.trim()) {
      alert('Veuillez entrer un titre pour le projet')
      return
    }

    // Valider les lignes de budget
    const validLines = budgetLines.filter(line =>
      line.category.trim() !== '' && line.allocated_amount > 0
    )

    try {
      setLoading(true)

      // Creer ou mettre a jour le projet
      let savedProjectId: string

      if (isEditMode && projectId) {
        await financeDataService.updateBudgetProject(projectId, {
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          responsible: formData.responsible || undefined,
          notes: formData.notes || undefined,
        })
        savedProjectId = projectId

        // Supprimer les anciennes lignes de budget
        await financeDataService.deleteProjectBudgetLines(projectId)
      } else {
        const newProject = await financeDataService.createBudgetProject({
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          responsible: formData.responsible || undefined,
          notes: formData.notes || undefined,
        })
        savedProjectId = newProject.id
      }

      // Creer les nouvelles lignes de budget
      if (validLines.length > 0) {
        for (const line of validLines) {
          await financeDataService.createProjectBudgetLine({
            project_id: savedProjectId,
            category: line.category,
            type: line.type,
            allocated_amount: line.allocated_amount,
            notes: line.notes,
          })
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du projet')
    } finally {
      setLoading(false)
    }
  }

  const incomeLines = budgetLines.filter(l => l.type === 'income')
  const expenseLines = budgetLines.filter(l => l.type === 'expense')

  const totalIncome = incomeLines.reduce((sum, l) => sum + (l.allocated_amount || 0), 0)
  const totalExpense = expenseLines.reduce((sum, l) => sum + (l.allocated_amount || 0), 0)
  const result = totalIncome - totalExpense

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Modifier le projet - ${formData.title}` : 'Nouveau projet budgetaire'}
      size="xl"
      scrollable
    >
      <div className="space-y-6">
        {/* Informations generales */}
        <div className="space-y-4">
          <FormField label="Titre du projet *" required>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Collection merchandising ete 2025"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type de projet *"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as BudgetProject['type'] })}
              options={Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />

            <Select
              label="Statut"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as BudgetProject['status'] })}
              options={Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>

          <FormField label="Description">
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du projet"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date de début">
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </FormField>

            <FormField label="Date de fin">
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Responsable">
            <Input
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              placeholder="Nom du responsable"
            />
          </FormField>
        </div>

        {/* Revenus */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg font-bold uppercase text-green-400">
              💰 Revenus previsionnels
            </h3>
            <Button variant="ghost" size="sm" onClick={() => addLine('income')}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {incomeLines.map(line => (
              <div key={line.id} className="flex items-center gap-2">
                <Input
                  value={line.category}
                  onChange={(e) => updateLine(line.id, 'category', e.target.value)}
                  placeholder="Categorie (ex: Ventes)"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={line.allocated_amount || ''}
                  onChange={(e) => updateLine(line.id, 'allocated_amount', Number(e.target.value))}
                  placeholder="Montant"
                  className="w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(line.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-end pt-2 border-t border-border-custom">
              <p className="font-heading text-lg font-bold text-green-400">
                Total: {totalIncome.toLocaleString('fr-FR')} EUR
              </p>
            </div>
          </div>
        </div>

        {/* Charges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-lg font-bold uppercase text-red-400">
              💸 Charges previsionnelles
            </h3>
            <Button variant="ghost" size="sm" onClick={() => addLine('expense')}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {expenseLines.map(line => (
              <div key={line.id} className="flex items-center gap-2">
                <Input
                  value={line.category}
                  onChange={(e) => updateLine(line.id, 'category', e.target.value)}
                  placeholder="Categorie (ex: Production)"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={line.allocated_amount || ''}
                  onChange={(e) => updateLine(line.id, 'allocated_amount', Number(e.target.value))}
                  placeholder="Montant"
                  className="w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(line.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-end pt-2 border-t border-border-custom">
              <p className="font-heading text-lg font-bold text-red-400">
                Total: {totalExpense.toLocaleString('fr-FR')} EUR
              </p>
            </div>
          </div>
        </div>

        {/* Resultat previsionnel */}
        <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-bold uppercase">Resultat previsionnel</p>
            <p className={`font-heading text-2xl font-bold ${
              result >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {result >= 0 ? '+' : ''}{result.toLocaleString('fr-FR')} EUR
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Enregistrement...' : isEditMode ? 'Mettre a jour' : 'Creer le projet'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

