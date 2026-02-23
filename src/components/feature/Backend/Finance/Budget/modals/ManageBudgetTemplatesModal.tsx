'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'
import { Input } from '@/components/ui/atoms'
import { Card, CardContent, CardHeader } from '@/components/ui/molecules'
import { FormField } from '@/components/ui/molecules'
import { Plus, Edit, Trash2, Copy, Save, X } from 'lucide-react'
import {
  getAllBudgetTemplatesWithLines,
  createBudgetTemplate,
  updateBudgetTemplate,
  deleteBudgetTemplate,
  duplicateBudgetTemplate,
} from '@/lib/stubs/supabase-stubs'
import type { BudgetTemplateWithLines, BudgetTemplateLine } from '@/types/finance'

interface ManageBudgetTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type BudgetLine = Omit<BudgetTemplateLine, 'id' | 'template_id' | 'created_at'>

export default function ManageBudgetTemplatesModal({
  isOpen,
  onClose,
  onSuccess,
}: ManageBudgetTemplatesModalProps) {
  const [templates, setTemplates] = useState<BudgetTemplateWithLines[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BudgetTemplateWithLines | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📊',
  })
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([])

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  async function loadTemplates() {
    try {
      const data = await getAllBudgetTemplatesWithLines()
      setTemplates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    }
  }

  function startNewTemplate() {
    setEditingTemplate(null)
    setFormData({ name: '', description: '', icon: '📊' })
    setBudgetLines([
      { category: '', type: 'income', allocated_amount: 0, sort_order: 0 },
    ])
    setShowForm(true)
  }

  function startEditTemplate(template: BudgetTemplateWithLines) {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      icon: template.icon || '📊',
    })
    setBudgetLines(template.lines.map(line => ({
      category: line.category,
      type: line.type,
      allocated_amount: line.allocated_amount,
      sort_order: line.sort_order,
    })))
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingTemplate(null)
    setFormData({ name: '', description: '', icon: '📊' })
    setBudgetLines([])
  }

  function addLine(type: 'income' | 'expense') {
    setBudgetLines([
      ...budgetLines,
      {
        category: '',
        type,
        allocated_amount: 0,
        sort_order: budgetLines.length,
      },
    ])
  }

  function updateLine(index: number, field: keyof BudgetLine, value: any) {
    const newLines = [...budgetLines]
    newLines[index] = { ...newLines[index], [field]: value }
    setBudgetLines(newLines)
  }

  function removeLine(index: number) {
    setBudgetLines(budgetLines.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      alert('Veuillez entrer un nom pour le template')
      return
    }

    const validLines = budgetLines.filter(line => 
      line.category.trim() !== '' && line.allocated_amount > 0
    )

    if (validLines.length === 0) {
      alert('Veuillez ajouter au moins une ligne de budget')
      return
    }

    try {
      setLoading(true)

      if (editingTemplate) {
        // Mise a jour
        await updateBudgetTemplate(editingTemplate.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          lines: validLines,
        })
      } else {
        // Creation
        await createBudgetTemplate({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          lines: validLines,
        })
      }

      await loadTemplates()
      cancelForm()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde du template')
    } finally {
      setLoading(false)
    }
  }

  async function handleDuplicate(template: BudgetTemplateWithLines) {
    const newName = prompt(`Nom du nouveau template (copie de "${template.name}") :`, `${template.name} (Copie)`)
    if (!newName) return

    try {
      setLoading(true)
      await duplicateBudgetTemplate(template.id, newName)
      await loadTemplates()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors de la duplication:', error)
      alert('Erreur lors de la duplication du template')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(template: BudgetTemplateWithLines) {
    if (template.is_default) {
      alert('Impossible de supprimer un template par defaut')
      return
    }

    if (!confirm(`Etes-vous sur de vouloir supprimer le template "${template.name}" ?`)) {
      return
    }

    try {
      setLoading(true)
      await deleteBudgetTemplate(template.id)
      await loadTemplates()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du template')
    } finally {
      setLoading(false)
    }
  }

  const incomeLines = budgetLines.filter(l => l.type === 'income')
  const expenseLines = budgetLines.filter(l => l.type === 'expense')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerer les templates de budget"
      size="xl"
      scrollable
    >
      {!showForm ? (
        /* Liste des templates */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Les templates permettent de creer rapidement des budgets pre-remplis pour vos evenements.
            </p>
            <Button variant="primary" size="sm" onClick={startNewTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau template
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {templates.map(template => {
              const totalIncome = template.lines
                .filter(l => l.type === 'income')
                .reduce((sum, l) => sum + l.allocated_amount, 0)
              const totalExpense = template.lines
                .filter(l => l.type === 'expense')
                .reduce((sum, l) => sum + l.allocated_amount, 0)
              const result = totalIncome - totalExpense

              return (
                <Card key={template.id}>
                  <CardHeader className="border-b border-border-custom">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h3 className="font-heading text-lg font-bold uppercase">
                            {template.name}
                            {template.is_default && (
                              <span className="ml-2 text-xs font-normal text-zinc-500">(Par defaut)</span>
                            )}
                          </h3>
                          {template.description && (
                            <p className="text-xs text-zinc-500">{template.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!template.is_default && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditTemplate(template)}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template)}
                              className="text-red-400 hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500 mb-1">Revenus</p>
                        <p className="font-mono font-bold text-green-400">
                          {totalIncome.toLocaleString('fr-FR')} EUR
                        </p>
                        <p className="text-xs text-zinc-500">
                          {template.lines.filter(l => l.type === 'income').length} lignes
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 mb-1">Charges</p>
                        <p className="font-mono font-bold text-red-400">
                          {totalExpense.toLocaleString('fr-FR')} EUR
                        </p>
                        <p className="text-xs text-zinc-500">
                          {template.lines.filter(l => l.type === 'expense').length} lignes
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500 mb-1">Resultat</p>
                        <p className={`font-mono font-bold ${result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {result >= 0 ? '+' : ''}{result.toLocaleString('fr-FR')} EUR
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        /* Formulaire de creation/edition */
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Icône">
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📊"
                className="text-2xl text-center"
              />
            </FormField>
            <div className="col-span-2">
              <FormField label="Nom du template *" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ma soiree type"
                />
              </FormField>
            </div>
          </div>

          <FormField label="Description">
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du template"
            />
          </FormField>

          {/* Revenus */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-green-400">
                💰 Revenus
              </h3>
              <Button variant="ghost" size="sm" onClick={() => addLine('income')}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {incomeLines.map((line, index) => {
                const actualIndex = budgetLines.findIndex(l => l === line)
                return (
                  <div key={actualIndex} className="flex items-center gap-2">
                    <Input
                      value={line.category}
                      onChange={(e) => updateLine(actualIndex, 'category', e.target.value)}
                      placeholder="Categorie"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={line.allocated_amount || ''}
                      onChange={(e) => updateLine(actualIndex, 'allocated_amount', Number(e.target.value))}
                      placeholder="Montant"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(actualIndex)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Charges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-red-400">
                💸 Charges
              </h3>
              <Button variant="ghost" size="sm" onClick={() => addLine('expense')}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {expenseLines.map((line, index) => {
                const actualIndex = budgetLines.findIndex(l => l === line)
                return (
                  <div key={actualIndex} className="flex items-center gap-2">
                    <Input
                      value={line.category}
                      onChange={(e) => updateLine(actualIndex, 'category', e.target.value)}
                      placeholder="Categorie"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={line.allocated_amount || ''}
                      onChange={(e) => updateLine(actualIndex, 'allocated_amount', Number(e.target.value))}
                      placeholder="Montant"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(actualIndex)}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <ModalFooter>
        {showForm ? (
          <>
            <Button variant="outline" size="sm" onClick={cancelForm} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Enregistrement...' : editingTemplate ? 'Mettre a jour' : 'Creer le template'}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

