'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal } from '@/components/ui/organisms'
import { Input, Select, Textarea } from '@/components/ui/atoms'
import { FormField } from '@/components/ui/molecules'
import { Button } from '@/components/ui/atoms'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import type { InvoiceLine, TransactionCategory } from '@/types/finance'

interface NewInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  type: 'invoice' | 'quote'
}

interface InvoiceFormData {
  issue_date: string
  due_date?: string
  client_type?: 'client' | 'supplier'
  client_name: string
  client_address?: string
  client_postal_code?: string
  client_city?: string
  client_email?: string
  category?: string
  payment_terms?: string
  notes?: string
  lines: {
    description: string
    quantity: number
    unit_price_excl_tax: number
    vat_rate: number
  }[]
}

const vatRates = [
  { value: '0', label: '0% (Exonere)' },
  { value: '5.5', label: '5,5% (Reduit)' },
  { value: '10', label: '10% (Reduit)' },
  { value: '20', label: '20% (Normal)' },
]

export default function NewInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  type,
}: NewInvoiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<TransactionCategory[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      issue_date: new Date().toISOString().split('T')[0],
      client_type: 'client',
      lines: [
        {
          description: '',
          quantity: 1,
          unit_price_excl_tax: 0,
          vat_rate: 20,
        },
      ],
    },
  })

  const clientType = watch('client_type')

  // Charger les categories selon le type de client
  useEffect(() => {
    if (isOpen && clientType) {
      loadCategories()
    }
  }, [isOpen, clientType])

  async function loadCategories() {
    try {
      const categoryType = clientType === 'supplier' ? 'expense' : 'income'
      const data = await financeDataService.getTransactionCategories(categoryType)
      setCategories(data || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des categories:', error)
      // Fallback vers les categories par defaut
      const defaultIncomeCategories = [
        'Billetterie',
        'Bar',
        'Merchandising',
        'Partenariats',
        'Subventions',
        'Adhesions',
        'Service',
        'Autres revenus',
      ]
      const defaultExpenseCategories = [
        'Location salle',
        'Artistes',
        'Prestation Artiste',
        'Technique & Sonorisation',
        'Securite',
        'Marketing & Communication',
        'Logistique',
        'Frais administratifs',
        'Ressources humaines',
        'Graphisme & Print',
        'Digital & Web',
        'Transport',
        'Comptabilite & Juridique',
        'Assurances',
        'Frais bancaires',
        'Service',
        'Divers',
      ]
      const defaultCategories = clientType === 'supplier' ? defaultExpenseCategories : defaultIncomeCategories
      setCategories(defaultCategories.map(name => ({
        id: name,
        name,
        type: clientType === 'supplier' ? 'expense' : 'income',
        is_default: true,
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })))
    }
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }))

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  })

  const watchedLines = watch('lines')

  // Calculer les totaux pour chaque ligne
  const calculateLineTotals = (line: InvoiceFormData['lines'][0]) => {
    const amount_excl_tax = line.quantity * line.unit_price_excl_tax
    const amount_vat = amount_excl_tax * (line.vat_rate / 100)
    const amount_incl_tax = amount_excl_tax + amount_vat

    return {
      amount_excl_tax: Math.round(amount_excl_tax * 100) / 100,
      amount_vat: Math.round(amount_vat * 100) / 100,
      amount_incl_tax: Math.round(amount_incl_tax * 100) / 100,
    }
  }

  // Calculer les totaux globaux
  const totals = watchedLines.reduce(
    (acc, line) => {
      const lineTotals = calculateLineTotals(line)
      return {
        subtotal: acc.subtotal + lineTotals.amount_excl_tax,
        vat: acc.vat + lineTotals.amount_vat,
        total: acc.total + lineTotals.amount_incl_tax,
      }
    },
    { subtotal: 0, vat: 0, total: 0 }
  )

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true)

      // Preparer les lignes avec les totaux calcules
      const lines = data.lines.map((line, index) => {
        const lineTotals = calculateLineTotals(line)
        return {
          description: line.description,
          quantity: line.quantity,
          unit_price_excl_tax: line.unit_price_excl_tax,
          vat_rate: line.vat_rate,
          order_index: index,
          ...lineTotals,
        }
      })

      const invoiceTotals = lines.reduce(
        (acc, l) => ({
          subtotal_excl_tax: acc.subtotal_excl_tax + l.amount_excl_tax,
          total_vat: acc.total_vat + l.amount_vat,
          total_incl_tax: acc.total_incl_tax + l.amount_incl_tax,
        }),
        { subtotal_excl_tax: 0, total_vat: 0, total_incl_tax: 0 }
      )

      await financeDataService.createInvoice({
        invoice: {
          type,
          issue_date: data.issue_date,
          due_date: data.due_date,
          status: type === 'quote' ? 'quote' : 'pending',
          client_type: data.client_type,
          client_name: data.client_name,
          client_address: data.client_address,
          client_postal_code: data.client_postal_code,
          client_city: data.client_city,
          client_email: data.client_email,
          category: data.category,
          payment_terms: data.payment_terms,
          notes: data.notes,
          ...invoiceTotals,
        },
        lines,
      })

      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors de la creation de la facture:', error)
      alert('Erreur lors de la creation de la facture')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={type === 'invoice' ? 'Nouvelle facture' : 'Nouveau devis'}
      size="lg"
      scrollable
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations generales */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date d'émission *" required error={errors.issue_date?.message}>
            <Input type="date" id="issue_date" {...register('issue_date', { required: 'La date est requise' })} />
          </FormField>

          {type === 'invoice' && (
            <FormField label="Date d'échéance" error={errors.due_date?.message}>
              <Input type="date" id="due_date" {...register('due_date')} />
            </FormField>
          )}
        </div>

        {/* Type de client */}
        <Select
          label="Type *"
          id="client_type"
          {...register('client_type', { required: 'Le type est requis' })}
          error={!!errors.client_type?.message}
          helperText={errors.client_type?.message}
          options={[
            { value: 'client', label: 'Client' },
            { value: 'supplier', label: 'Fournisseur' },
          ]}
        />

        {/* Categorie (uniquement pour les factures de fournisseurs) */}
        {clientType === 'supplier' && (
          <Select
            label="Categorie"
            id="category"
            {...register('category')}
            error={!!errors.category?.message}
            helperText={errors.category?.message || "Catégorie pour le classement dans le bilan financier"}
            options={[
              { value: '', label: 'Selectionner une categorie...' },
              ...categoryOptions,
            ]}
          />
        )}

        {/* Informations client */}
        <div className="space-y-4">
          <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Informations {watch('client_type') === 'client' ? 'client' : 'fournisseur'}
          </h3>

          <FormField label="Nom *" required error={errors.client_name?.message}>
            <Input id="client_name" placeholder="Nom complet ou raison sociale" {...register('client_name', { required: 'Le nom est requis' })} />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Adresse" error={errors.client_address?.message}>
              <Input id="client_address" placeholder="Rue et numéro" {...register('client_address')} />
            </FormField>
            <FormField label="Code postal" error={errors.client_postal_code?.message}>
              <Input id="client_postal_code" placeholder="75001" {...register('client_postal_code')} />
            </FormField>
            <FormField label="Ville" error={errors.client_city?.message}>
              <Input id="client_city" placeholder="Paris" {...register('client_city')} />
            </FormField>
          </div>

          <FormField label="Email" error={errors.client_email?.message}>
            <Input type="email" id="client_email" placeholder="contact@example.com" {...register('client_email')} />
          </FormField>
        </div>

        {/* Lignes de facture */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Lignes de facture
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({
                  description: '',
                  quantity: 1,
                  unit_price_excl_tax: 0,
                  vat_rate: 20,
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const line = watchedLines[index]
              const lineTotals = line ? calculateLineTotals(line) : { amount_excl_tax: 0, amount_vat: 0, amount_incl_tax: 0 }

              return (
                <div
                  key={field.id}
                  className="p-4 border-2 border-border-custom rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-zinc-500 font-label uppercase">
                      Ligne {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <FormField label="Description *" required error={errors.lines?.[index]?.description?.message}>
                    <Input
                      placeholder="Description du produit ou service"
                      {...register(`lines.${index}.description`, {
                        required: 'La description est requise',
                      })}
                    />
                  </FormField>

                  <div className="grid grid-cols-4 gap-3">
                    <FormField label="Quantité *" required error={errors.lines?.[index]?.quantity?.message}>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1"
                        {...register(`lines.${index}.quantity`, {
                          required: 'La quantité est requise',
                          min: { value: 0.01, message: 'La quantité doit être > 0' },
                          valueAsNumber: true,
                        })}
                      />
                    </FormField>

                    <FormField label="Prix unitaire HT *" required error={errors.lines?.[index]?.unit_price_excl_tax?.message}>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`lines.${index}.unit_price_excl_tax`, {
                          required: 'Le prix est requis',
                          min: { value: 0, message: 'Le prix doit être >= 0' },
                          valueAsNumber: true,
                        })}
                      />
                    </FormField>

                    <div className="col-span-2">
                      <Select
                        label="Taux TVA *"
                        {...register(`lines.${index}.vat_rate`, {
                          required: 'Le taux TVA est requis',
                          valueAsNumber: true,
                        })}
                        error={!!errors.lines?.[index]?.vat_rate?.message}
                        helperText={errors.lines?.[index]?.vat_rate?.message}
                        options={vatRates}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-custom">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-zinc-500">HT: </span>
                        <span className="font-mono font-bold">
                          {lineTotals.amount_excl_tax.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          EUR
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">TVA: </span>
                        <span className="font-mono font-bold">
                          {lineTotals.amount_vat.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          EUR
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">TTC: </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
                          {lineTotals.amount_incl_tax.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          EUR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Totaux */}
        <div className="p-4 bg-background-tertiary border-2 border-border-custom rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Sous-total HT:</span>
              <span className="font-mono font-bold">
                {totals.subtotal.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                EUR
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">TVA:</span>
              <span className="font-mono font-bold">
                {totals.vat.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                EUR
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-border-custom">
              <span className="font-heading uppercase tracking-wider">Total TTC:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
                {totals.total.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                EUR
              </span>
            </div>
          </div>
        </div>

        {/* Conditions de paiement et notes */}
        {type === 'invoice' && (
          <FormField label="Conditions de paiement" error={errors.payment_terms?.message}>
            <Input id="payment_terms" placeholder="Ex: Paiement à 30 jours" {...register('payment_terms')} />
          </FormField>
        )}

        <FormField label="Notes">
          <Textarea id="notes" placeholder="Informations complémentaires..." rows={3} {...register('notes')} />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creation...' : type === 'invoice' ? 'Creer la facture' : 'Creer le devis'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

