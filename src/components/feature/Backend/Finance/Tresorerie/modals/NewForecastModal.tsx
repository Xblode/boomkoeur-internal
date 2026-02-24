'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Input, Select, Textarea, Button } from '@/components/ui/atoms'
import { FormField } from '@/components/ui/molecules'
import { useForm } from 'react-hook-form'
import { createTreasuryForecast } from '@/lib/supabase/finance'

interface NewForecastModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ForecastFormData {
  date: string
  type: 'income' | 'expense'
  label: string
  amount: number
  category: string
  certainty_level: 'confirmed' | 'probable' | 'uncertain'
  notes?: string
}

const incomeCategories = [
  { value: 'Adhesions', label: 'Adhesions' },
  { value: 'Billetterie', label: 'Billetterie' },
  { value: 'Subventions', label: 'Subventions' },
  { value: 'Dons', label: 'Dons' },
  { value: 'Sponsoring', label: 'Sponsoring' },
  { value: 'Merchandising', label: 'Merchandising' },
  { value: 'Autres recettes', label: 'Autres recettes' },
]

const expenseCategories = [
  { value: 'Location salle', label: 'Location salle' },
  { value: 'Materiel technique', label: 'Materiel technique' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Artistes', label: 'Artistes' },
  { value: 'Securite', label: 'Securite' },
  { value: 'Assurances', label: 'Assurances' },
  { value: 'Salaires', label: 'Salaires' },
  { value: 'Charges sociales', label: 'Charges sociales' },
  { value: 'Frais bancaires', label: 'Frais bancaires' },
  { value: 'Fournitures', label: 'Fournitures' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Restauration', label: 'Restauration' },
  { value: 'Services externes', label: 'Services externes' },
  { value: 'Impots et taxes', label: 'Impots et taxes' },
  { value: 'Autres charges', label: 'Autres charges' },
]

const certaintyLevels = [
  { value: 'confirmed', label: '✅ Confirme' },
  { value: 'probable', label: '🟡 Probable' },
  { value: 'uncertain', label: '❓ Incertain' },
]

export default function NewForecastModal({ isOpen, onClose, onSuccess }: NewForecastModalProps) {
  const [loading, setLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ForecastFormData>({
    defaultValues: {
      type: 'income',
      certainty_level: 'probable',
      category: '',
    },
  })

  useEffect(() => {
    setValue('type', transactionType)
    setValue('category', transactionType === 'income' ? incomeCategories[0].value : expenseCategories[0].value)
  }, [transactionType, setValue])

  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'income',
        certainty_level: 'probable',
        category: incomeCategories[0].value,
      })
      setTransactionType('income')
    }
  }, [isOpen, reset])

  const handleClose = () => {
    reset()
    setTransactionType('income')
    onClose()
  }

  const onSubmit = async (data: ForecastFormData) => {
    try {
      setLoading(true)
      
      await createTreasuryForecast({
        date: data.date,
        type: data.type,
        label: data.label,
        amount: Number(data.amount) || 0,
        category: data.category,
        certainty_level: data.certainty_level,
        notes: data.notes || undefined,
        realized: false,
      })

      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors de la creation de la prevision:', error)
      alert('Erreur lors de la creation de la prevision')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouvelle prevision de tresorerie" size="lg">
      <form id="new-forecast-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type de prevision */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setTransactionType('income')}
            className={`p-4 border-2 rounded transition-all h-auto flex flex-col items-start ${
              transactionType === 'income'
                ? 'border-green-500 bg-green-500/10'
                : 'border-border-custom hover:border-green-500/50'
            }`}
          >
            <div className="text-3xl mb-2">⬆️</div>
            <div className="font-heading text-sm uppercase">Entree prevue</div>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setTransactionType('expense')}
            className={`p-4 border-2 rounded transition-all h-auto flex flex-col items-start ${
              transactionType === 'expense'
                ? 'border-red-500 bg-red-500/10'
                : 'border-border-custom hover:border-red-500/50'
            }`}
          >
            <div className="text-3xl mb-2">⬇️</div>
            <div className="font-heading text-sm uppercase">Sortie prevue</div>
          </Button>
        </div>

        <input type="hidden" {...register('type')} />

        {/* Date et Montant */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date prévue *" required error={errors.date?.message}>
            <Input type="date" id="date" {...register('date', { required: 'La date est requise' })} />
          </FormField>

          <FormField label="Montant *" required error={errors.amount?.message}>
            <Input
              type="number"
              step="0.01"
              id="amount"
              placeholder="0.00"
              {...register('amount', {
                required: 'Le montant est requis',
                min: { value: 0.01, message: 'Le montant doit être supérieur à 0' },
              })}
            />
          </FormField>
        </div>

        {/* Libelle */}
        <FormField label="Libellé *" required error={errors.label?.message}>
          <Input id="label" placeholder="Description de la prévision" {...register('label', { required: 'Le libellé est requis' })} />
        </FormField>

        {/* Categorie et Niveau de certitude */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Catégorie *"
            id="category"
            {...register('category', { required: 'La catégorie est requise' })}
            error={!!errors.category?.message}
            helperText={errors.category?.message}
            options={transactionType === 'income' ? incomeCategories : expenseCategories}
          />

          <Select
            label="Niveau de certitude *"
            id="certainty_level"
            {...register('certainty_level', { required: 'Le niveau de certitude est requis' })}
            error={!!errors.certainty_level?.message}
            helperText={errors.certainty_level?.message}
            options={certaintyLevels}
          />
        </div>

        {/* Notes */}
        <FormField label="Notes">
          <Textarea id="notes" placeholder="Informations complémentaires..." rows={3} {...register('notes')} />
        </FormField>
      </form>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" form="new-forecast-form" variant="primary" size="sm" disabled={loading}>
          {loading ? 'Creation...' : 'Creer la prevision'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

