'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal } from '@/components/ui/organisms'
import { Input, Textarea } from '@/components/ui/atoms'
import { FormField } from '@/components/ui/molecules'
import { Button } from '@/components/ui/atoms'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  year: number
  existingBudget?: any
}

const availableCategories = [
  'Location salle',
  'Artistes',
  'Materiel technique',
  'Securite',
  'Communication',
  'Marketing & Communication',
  'Assurances',
  'Comptabilite/Juridique',
  'Frais bancaires',
  'Transport',
  'Restauration',
  'Services externes',
  'Impots et taxes',
  'Ressources humaines',
  'Merchandising',
  'Autres charges',
]

export default function NewBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  year,
  existingBudget,
}: NewBudgetModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    total_budget: '',
    description: '',
    target_events_count: '',
    target_revenue: '',
    target_margin: '',
    categories: [] as { category: string; allocated_amount: number; notes?: string }[],
  })

  useEffect(() => {
    if (existingBudget && isOpen) {
      setFormData({
        total_budget: existingBudget.total_budget?.toString() || '',
        description: existingBudget.description || '',
        target_events_count: existingBudget.target_events_count?.toString() || '',
        target_revenue: existingBudget.target_revenue?.toString() || '',
        target_margin: existingBudget.target_margin?.toString() || '',
        categories:
          existingBudget.budget_categories?.map((cat: any) => ({
            category: cat.category,
            allocated_amount: cat.allocated_amount,
            notes: cat.notes,
          })) || [],
      })
    } else if (isOpen) {
      // Reset form for new budget
      setFormData({
        total_budget: '',
        description: '',
        target_events_count: '',
        target_revenue: '',
        target_margin: '',
        categories: [],
      })
    }
  }, [existingBudget, isOpen])

  const handleAddCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { category: '', allocated_amount: 0 }],
    })
  }

  const handleRemoveCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index),
    })
  }

  const handleCategoryChange = (index: number, field: string, value: any) => {
    const updated = [...formData.categories]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, categories: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.total_budget || parseFloat(formData.total_budget) <= 0) {
      setError('Le budget total doit etre superieur a 0')
      return
    }

    if (formData.categories.length === 0) {
      setError('Ajoutez au moins une categorie')
      return
    }

    const totalAllocated = formData.categories.reduce(
      (sum, cat) => sum + (cat.allocated_amount || 0),
      0
    )

    if (Math.abs(totalAllocated - parseFloat(formData.total_budget)) > 0.01) {
      setError(
        `Le total des categories (${totalAllocated.toLocaleString('fr-FR')} EUR) ne correspond pas au budget total (${parseFloat(formData.total_budget).toLocaleString('fr-FR')} EUR)`
      )
      return
    }

    try {
      setLoading(true)

      const budgetData = {
        year,
        total_budget: parseFloat(formData.total_budget),
        description: formData.description || undefined,
        target_events_count: formData.target_events_count ? parseInt(formData.target_events_count) : undefined,
        target_revenue: formData.target_revenue ? parseFloat(formData.target_revenue) : undefined,
        target_margin: formData.target_margin ? parseFloat(formData.target_margin) : undefined,
        categories: formData.categories.map((cat) => ({
          category: cat.category,
          allocated_amount: cat.allocated_amount,
          notes: cat.notes,
        })),
      }

      if (existingBudget) {
        await financeDataService.updateBudget(existingBudget.id, {
          total_budget: budgetData.total_budget,
          description: budgetData.description,
          target_events_count: budgetData.target_events_count,
          target_revenue: budgetData.target_revenue,
          target_margin: budgetData.target_margin,
          categories: budgetData.categories,
        })
      } else {
        await financeDataService.createBudget({
          budget: {
            year,
            total_budget: budgetData.total_budget,
            description: budgetData.description,
            target_events_count: budgetData.target_events_count,
            target_revenue: budgetData.target_revenue,
            target_margin: budgetData.target_margin,
            status: 'active',
          },
          categories: budgetData.categories.map((c) => ({
            category: c.category,
            allocated_amount: c.allocated_amount,
            notes: c.notes,
            spent_amount: 0,
          })),
        })
      }

      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const totalAllocated = formData.categories.reduce(
    (sum, cat) => sum + (cat.allocated_amount || 0),
    0
  )
  const totalBudget = parseFloat(formData.total_budget) || 0
  const remaining = totalBudget - totalAllocated

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingBudget ? 'Modifier le budget' : 'Creer un budget'}
      size="lg"
      scrollable
    >
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500 rounded">
          <p className="font-body text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations generales */}
        <div className="space-y-4">
          <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Informations generales
          </h3>

          <FormField label="Budget total (EUR) *" required>
            <Input
              type="number"
              step="0.01"
              value={formData.total_budget}
              onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
              placeholder="50000"
              required
            />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Objectif événements">
              <Input
                type="number"
                value={formData.target_events_count}
                onChange={(e) => setFormData({ ...formData, target_events_count: e.target.value })}
                placeholder="12"
              />
            </FormField>
            <FormField label="Objectif revenus (EUR)">
              <Input
                type="number"
                step="0.01"
                value={formData.target_revenue}
                onChange={(e) => setFormData({ ...formData, target_revenue: e.target.value })}
                placeholder="100000"
              />
            </FormField>
            <FormField label="Marge cible (%)">
              <Input
                type="number"
                step="0.1"
                value={formData.target_margin}
                onChange={(e) => setFormData({ ...formData, target_margin: e.target.value })}
                placeholder="20"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Notes sur le budget..."
            />
          </FormField>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Categories budgetaires
            </h3>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une categorie
            </Button>
          </div>

          <div className="space-y-3">
            {formData.categories.map((category, index) => (
              <div
                key={index}
                className="p-4 border-2 border-border-custom rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs text-zinc-500 font-label uppercase">
                    Categorie {index + 1}
                  </span>
                  {formData.categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                      Categorie *
                    </label>
                    <select
                      value={category.category}
                      onChange={(e) => handleCategoryChange(index, 'category', e.target.value)}
                      className={cn(
                        'w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-border-custom text-foreground px-4 py-2',
                        'font-body text-sm',
                        'focus:outline-none focus:border-accent',
                        'transition-colors duration-300',
                        'cursor-pointer appearance-none',
                        'bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:16px] pr-10',
                        'h-[38px]'
                      )}
                      required
                    >
                      <option value="">Selectionner une categorie</option>
                      {availableCategories
                        .filter((cat) => !formData.categories.some((c, i) => c.category === cat && i !== index))
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>

                  <FormField label="Montant alloué (EUR) *" required>
                    <Input
                      type="number"
                      step="0.01"
                      value={category.allocated_amount || ''}
                      onChange={(e) =>
                        handleCategoryChange(index, 'allocated_amount', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      required
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          {formData.categories.length === 0 && (
            <div className="text-center py-8 text-zinc-500 border-2 border-dashed border-border-custom rounded-lg">
              <p className="mb-2">Aucune categorie ajoutee</p>
              <p className="text-sm">Cliquez sur "Ajouter une categorie" pour commencer</p>
            </div>
          )}
        </div>

        {/* Recapitulatif */}
        {formData.total_budget && formData.categories.length > 0 && (
          <div className="p-4 bg-background-tertiary border-2 border-border-custom rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Budget total:</span>
                <span className="font-mono font-bold">
                  {totalBudget.toLocaleString('fr-FR')} EUR
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total alloue:</span>
                <span className="font-mono font-bold">
                  {totalAllocated.toLocaleString('fr-FR')} EUR
                </span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-border-custom">
                <span className="font-heading uppercase tracking-wider">Reste a allouer:</span>
                <span
                  className={cn(
                    'font-mono font-bold',
                    remaining >= 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {remaining >= 0 ? '+' : ''}
                  {remaining.toLocaleString('fr-FR')} EUR
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading
              ? existingBudget
                ? 'Modification...'
                : 'Creation...'
              : existingBudget
              ? 'Enregistrer les modifications'
              : 'Creer le budget'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

