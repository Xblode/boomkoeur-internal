'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'
import { Input } from '@/components/ui/atoms'
import { Select } from '@/components/ui/atoms'
import { Plus, Trash2, Copy } from 'lucide-react'
import {
  getAllBudgetTemplatesWithLines,
  getEventBudgets,
  createEventBudgets,
  deleteAllEventBudgets,
} from '@/lib/supabase/finance'
import { getEventById } from '@/lib/supabase/events'
import type { EventBudget, BudgetTemplateWithLines } from '@/types/finance'

interface CreateEventBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  /** Appelé après succès. eventId et isNew permettent d'ajouter l'élément lié à l'event. */
  onSuccess?: (eventId?: string, isNew?: boolean) => void
  eventId: string | null
}

type BudgetLine = {
  id: string
  category: string
  type: 'income' | 'expense'
  allocated_amount: number
  notes?: string
}

export default function CreateEventBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
}: CreateEventBudgetModalProps) {
  const [eventTitle, setEventTitle] = useState('')
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [templates, setTemplates] = useState<BudgetTemplateWithLines[]>([])

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
      if (eventId) {
        loadEventAndBudget()
      } else {
        resetForm()
      }
    }
  }, [isOpen, eventId])

  async function loadTemplates() {
    try {
      const data = await getAllBudgetTemplatesWithLines()
      setTemplates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    }
  }

  async function loadEventAndBudget() {
    if (!eventId) return

    try {
      // Charger l'événement
      const event = await getEventById(eventId)
      if (event) {
        setEventTitle(event.name)
      }

      // Charger le budget existant
      const existingBudgets = await getEventBudgets(eventId)
      
      if (existingBudgets && existingBudgets.length > 0) {
        setIsEditMode(true)
        setBudgetLines(existingBudgets.map(b => ({
          id: b.id,
          category: b.category,
          type: b.type,
          allocated_amount: b.allocated_amount,
          notes: b.notes,
        })))
      } else {
        setIsEditMode(false)
        // Initialiser avec quelques lignes vides
        setBudgetLines([
          { id: crypto.randomUUID(), category: '', type: 'income', allocated_amount: 0 },
          { id: crypto.randomUUID(), category: '', type: 'expense', allocated_amount: 0 },
        ])
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    }
  }

  function resetForm() {
    setEventTitle('')
    setBudgetLines([])
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

  async function loadTemplate(templateId: string) {
    if (!eventId) return

    const confirmed = confirm(
      'Charger ce template remplacera toutes les lignes actuelles. Continuer ?'
    )
    if (!confirmed) return

    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      setBudgetLines(template.lines.map(line => ({
        id: crypto.randomUUID(),
        category: line.category,
        type: line.type,
        allocated_amount: line.allocated_amount,
      })))
    } catch (error) {
      console.error('Erreur lors du chargement du template:', error)
      alert('Erreur lors du chargement du template')
    }
  }

  async function handleSubmit() {
    if (!eventId) return

    // Valider les donnees
    const validLines = budgetLines.filter(line => 
      line.category.trim() !== '' && line.allocated_amount > 0
    )

    if (validLines.length === 0) {
      alert('Veuillez ajouter au moins une ligne de budget valide')
      return
    }

    try {
      setLoading(true)

      // Supprimer l'ancien budget si en mode edition
      if (isEditMode) {
        await deleteAllEventBudgets(eventId)
      }

      // Creer le nouveau budget
      const budgetsToCreate = validLines.map(line => ({
        event_id: eventId,
        category: line.category,
        type: line.type,
        allocated_amount: line.allocated_amount,
        notes: line.notes,
      }))

      await createEventBudgets(budgetsToCreate)

      onSuccess?.(eventId, !isEditMode)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du budget')
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
      title={isEditMode ? `Modifier le budget - ${eventTitle}` : `Creer un budget - ${eventTitle}`}
      size="xl"
      scrollable
    >
      <div className="space-y-6">
        {/* Templates */}
        {!isEditMode && templates.length > 0 && (
          <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
            <p className="font-heading text-sm font-bold uppercase mb-3">Templates de budget</p>
            <div className="flex flex-wrap gap-2">
              {templates.map(template => (
                <Button
                  key={template.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => loadTemplate(template.id)}
                >
                  {template.icon && <span className="mr-2">{template.icon}</span>}
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        )}

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
                  placeholder="Categorie (ex: Billetterie)"
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
                  placeholder="Categorie (ex: Location salle)"
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
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enregistrement...' : isEditMode ? 'Mettre a jour' : 'Creer le budget'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

