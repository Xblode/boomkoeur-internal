'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter, Button, Input, Select, Textarea } from '@/components/ui'
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
    color: '#3b82f6',
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
      color: '#3b82f6',
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
      color: category.color || '#3b82f6',
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
          <label className="text-sm font-label uppercase tracking-wider text-zinc-500">Type</label>
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
          <div className="p-4 bg-background-tertiary rounded-lg border border-border-custom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg uppercase">
                {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
                className="text-zinc-500 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                  Nom *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de la categorie"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                    Couleur
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 rounded border-2 border-border-custom cursor-pointer"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                    Ordre d'affichage
                  </label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-label uppercase tracking-wider text-zinc-500 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {editingCategory ? 'Modifier' : 'Creer'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategory(null)
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
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
              <p className="text-sm text-zinc-500 p-4 text-center">
                Aucune categorie personnalisee. Cliquez sur "Ajouter" pour en creer une.
              </p>
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
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-zinc-900 dark:text-zinc-50 hover:text-zinc-900 dark:text-zinc-50/80 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

