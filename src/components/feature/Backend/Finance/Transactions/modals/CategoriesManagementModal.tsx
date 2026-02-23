'use client'

import { useState, useEffect } from 'react'
import { CHART_SERIES_COLORS } from '@/lib/constants/chart-colors'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter, Button, Input, Select, Textarea, Label, IconButton, Card, EmptyState } from '@/components/ui'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import type { TransactionCategory } from '@/types/finance'

interface CategoriesManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CategoriesManagementModal({
  isOpen,
  onClose,
  onSuccess,
}: CategoriesManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('income')
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    color: CHART_SERIES_COLORS.bar,
    icon: '',
    description: '',
    sort_order: 0,
  })

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen, selectedType])

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await financeDataService.getTransactionCategories(selectedType)
      setCategories(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des categories:', error)
      setError('Erreur lors du chargement des categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      color: CHART_SERIES_COLORS.bar,
      icon: '',
      description: '',
      sort_order: categories.length + 1,
    })
    setShowForm(true)
    setError('')
  }

  const handleEdit = (category: TransactionCategory) => {
    if (category.is_default) {
      setError('Les categories par defaut ne peuvent pas etre modifiees')
      return
    }
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color || CHART_SERIES_COLORS.bar,
      icon: category.icon || '',
      description: category.description || '',
      sort_order: category.sort_order,
    })
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette categorie ?')) return

    try {
      setLoading(true)
      await financeDataService.deleteTransactionCategory(id)
      await loadCategories()
      onSuccess()
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      setError(error.message || 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Le nom de la categorie est obligatoire')
      return
    }

    try {
      setLoading(true)

      if (editingCategory) {
        await financeDataService.updateTransactionCategory(editingCategory.id, formData)
      } else {
        await financeDataService.createTransactionCategory({
          ...formData,
          type: selectedType,
          is_active: true,
          is_default: false,
        })
      }

      setShowForm(false)
      setEditingCategory(null)
      await loadCategories()
      onSuccess()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const defaultCategories = categories.filter((c) => c.is_default)
  const customCategories = categories.filter((c) => !c.is_default && c.is_active)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestion des categories" size="xl" scrollable>
      <div className="space-y-6">
        {/* Selecteur de type */}
        <div className="flex items-center gap-4">
          <Label className="text-sm font-label uppercase tracking-wider text-zinc-500">Type</Label>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'income' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSelectedType('income')
                setShowForm(false)
              }}
            >
              Revenus
            </Button>
            <Button
              variant={selectedType === 'expense' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSelectedType('expense')
                setShowForm(false)
              }}
            >
              Depenses
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Formulaire de creation/edition */}
        {showForm && (
          <Card variant="outline" className="p-4 bg-background-tertiary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg uppercase">
                {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
              </h3>
              <IconButton
                icon={<X className="w-5 h-5" />}
                ariaLabel="Fermer"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
                className="text-zinc-500 hover:text-foreground transition-colors"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                  Nom *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la categorie"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                    Couleur
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 rounded border-2 border-border-custom cursor-pointer p-1 min-h-0"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder={CHART_SERIES_COLORS.bar}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                    Ordre d'affichage
                  </Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                  Description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={loading}>
                  {editingCategory ? 'Modifier' : 'Creer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategory(null)
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Liste des categories */}
        <div className="space-y-4">
          {/* Categories par defaut */}
          {defaultCategories.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase text-zinc-500 mb-3">
                Categories par defaut
              </h3>
              <div className="space-y-2">
                {defaultCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded border border-border-custom"
                  >
                    <div className="flex items-center gap-3">
                      {category.color && (
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className="font-medium">{category.name}</span>
                      {category.description && (
                        <span className="text-sm text-zinc-500">- {category.description}</span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">Par defaut</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories personnalisees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm uppercase text-zinc-500">
                Categories personnalisees
              </h3>
              {!showForm && (
                <Button variant="primary" size="sm" onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
            </div>
            {customCategories.length === 0 ? (
              <EmptyState
                title="Aucune catégorie personnalisée"
                description='Cliquez sur "Ajouter" pour en créer une.'
                variant="inline"
              />
            ) : (
              <div className="space-y-2">
                {customCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded border border-border-custom hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {category.color && (
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className="font-medium">{category.name}</span>
                      {category.description && (
                        <span className="text-sm text-zinc-500">- {category.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <IconButton
                        icon={<Edit className="w-4 h-4" />}
                        ariaLabel="Modifier"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="text-zinc-900 dark:text-zinc-50 hover:text-zinc-900 dark:text-zinc-50/80 transition-colors"
                        title="Modifier"
                      />
                      <IconButton
                        icon={<Trash2 className="w-4 h-4" />}
                        ariaLabel="Supprimer"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

