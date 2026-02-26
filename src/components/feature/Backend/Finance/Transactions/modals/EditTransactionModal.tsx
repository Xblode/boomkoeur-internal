'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { useBankAccounts, useTransactionCategories } from '@/hooks'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button, Input, Select, Textarea, Label, Checkbox, FormLabel } from '@/components/ui/atoms'
import { TagMultiSelect, AssetUploaderPanel, FormField } from '@/components/ui/molecules'
import type { Transaction, TransactionCategory, BankAccount } from '@/types/finance'
import { useUpdateTransactionTags } from '@/lib/stubs/supabase-stubs'

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transaction: Transaction | null
  /** Quand true, rend le formulaire sans wrapper Modal (pour panneau latéral) */
  renderAsPanel?: boolean
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
  renderAsPanel = false,
}: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Utiliser le hook stub pour les tags
  const transactionTags: any[] = []
  const updateTags = useUpdateTransactionTags()
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    label: '',
    amount: '',
    category: '',
    bank_account_id: '',
    payment_method: '',
    piece_number: '',
    vat_applicable: false,
    vat_rate: '20',
    notes: '',
    status: 'pending' as 'pending' | 'validated' | 'reconciled',
    paid_by_member: false,
    member_name: '',
    reimbursement_status: 'not_required' as 'not_required' | 'pending' | 'reimbursed',
    reimbursement_notes: '',
  })

  // Charger les donnees de la transaction quand elle change
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        date: transaction.date instanceof Date 
          ? transaction.date.toISOString().split('T')[0]
          : transaction.date.split('T')[0],
        label: transaction.label || '',
        amount: transaction.amount?.toString() || '',
        category: transaction.category || '',
        bank_account_id: transaction.bank_account_id || '',
        payment_method: transaction.payment_method || '',
        piece_number: transaction.piece_number || '',
        vat_applicable: transaction.vat_applicable || false,
        vat_rate: transaction.vat_rate?.toString() || '20',
        notes: transaction.notes || '',
        status: transaction.status || 'pending',
        paid_by_member: transaction.paid_by_member || false,
        member_name: transaction.member_name || '',
        reimbursement_status: transaction.reimbursement_status || 'not_required',
        reimbursement_notes: transaction.reimbursement_notes || '',
      })
    }
  }, [transaction])

  // Charger les tags de la transaction
  useEffect(() => {
    if (transactionTags) {
      const newTagIds = transactionTags.map((tag) => tag.id)
      // Eviter la boucle infinie en comparant les IDs
      const currentIds = selectedTagIds.sort().join(',')
      const newIds = newTagIds.sort().join(',')
      if (currentIds !== newIds) {
        setSelectedTagIds(newTagIds)
      }
    }
  }, [transactionTags])

  const { accounts: bankAccounts } = useBankAccounts()
  const { categories } = useTransactionCategories(formData.type)

  const defaultIncomeCategories = ['Billetterie', 'Bar', 'Merchandising', 'Partenariats', 'Subventions', 'Adhesions', 'Service', 'Autres revenus']
  const defaultExpenseCategories = ['Location salle', 'Artistes', 'Prestation Artiste', 'Technique & Sonorisation', 'Securite', 'Marketing & Communication', 'Logistique', 'Frais administratifs', 'Ressources humaines', 'Graphisme & Print', 'Digital & Web', 'Transport', 'Comptabilite & Juridique', 'Assurances', 'Frais bancaires', 'Service', 'Divers']
  const fallbackCategories = (formData.type === 'income' ? defaultIncomeCategories : defaultExpenseCategories).map((name) => ({
    id: name,
    name,
    type: formData.type,
    is_default: true,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
  const categoryOptions = (categories.length > 0 ? categories : fallbackCategories).map((cat) => ({
    value: cat.name,
    label: cat.name,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!transaction) {
      setError('Aucune transaction selectionnee')
      return
    }

    if (!formData.label || !formData.amount || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setLoading(true)

      const amount = parseFloat(formData.amount)
      const amount_excl_tax = formData.vat_applicable
        ? amount / (1 + parseFloat(formData.vat_rate) / 100)
        : amount

      // Mettre a jour la transaction
      await financeDataService.updateTransaction(transaction.id, {
        type: formData.type,
        date: formData.date,
        label: formData.label,
        amount,
        category: formData.category,
        bank_account_id: formData.bank_account_id || undefined,
        payment_method: formData.payment_method || undefined,
        piece_number: formData.piece_number || undefined,
        vat_applicable: formData.vat_applicable,
        vat_rate: formData.vat_applicable ? parseFloat(formData.vat_rate) : undefined,
        amount_excl_tax: formData.vat_applicable ? amount_excl_tax : undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        paid_by_member: formData.paid_by_member,
        member_name: formData.paid_by_member ? formData.member_name : undefined,
        reimbursement_status: formData.paid_by_member ? formData.reimbursement_status : 'not_required',
        reimbursement_notes: formData.paid_by_member ? formData.reimbursement_notes : undefined,
      })

      // Mettre a jour les tags
      await updateTags.mutateAsync({
        transactionId: transaction.id,
        tagIds: selectedTagIds,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!transaction) {
    return null
  }

  const formContent = (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500 rounded">
          <p className="font-body text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Numero d'ecriture (lecture seule) */}
        <div className="p-3 bg-background-tertiary border-2 border-border-custom rounded">
          <FormLabel className="mb-1">
            N° Ecriture
          </FormLabel>
          <p className="font-mono text-sm text-zinc-900 dark:text-zinc-50 font-bold">{transaction.entry_number}</p>
        </div>

        {/* Type */}
        <div>
          <FormLabel>
            Type *
          </FormLabel>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`
                py-3 px-4 rounded border-2 font-heading text-sm uppercase tracking-wide transition-all
                ${formData.type === 'income'
                  ? 'bg-green-500 text-black border-green-500'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-border-custom hover:border-green-500'
                }
              `}
            >
              ⬆️ Entree
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`
                py-3 px-4 rounded border-2 font-heading text-sm uppercase tracking-wide transition-all
                ${formData.type === 'expense'
                  ? 'bg-red-500 text-black border-red-500'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-border-custom hover:border-red-500'
                }
              `}
            >
              ⬇️ Sortie
            </Button>
          </div>
        </div>

        {/* Date et Montant */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date *" required>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Montant (EUR) *" required>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </FormField>
        </div>

        {/* Libelle */}
        <FormField label="Libellé *" required>
          <Input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="Ex: Billetterie Event Spring"
            required
          />
        </FormField>

        {/* Categorie */}
        <Select
          label="Categorie *"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: '', label: 'Selectionner une categorie' },
              ...categoryOptions
            ]}
          required
        />

        {/* Compte bancaire */}
        <Select
          label="Compte bancaire"
          value={formData.bank_account_id}
          onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
          options={[
            { value: '', label: 'Selectionner un compte' },
            ...bankAccounts.map(account => ({
              value: account.id,
              label: `${account.name} - ${account.bank_name}`,
            }))
          ]}
          helperText="Compte sur lequel la transaction a ete effectuee"
        />

        {/* Moyen de paiement et N° de piece */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Moyen de paiement"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            options={[
              { value: '', label: 'Selectionner' },
              { value: 'virement', label: 'Virement' },
              { value: 'carte', label: 'Carte bancaire' },
              { value: 'especes', label: 'Especes' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'prelevement', label: 'Prelevement' },
            ]}
          />

          <FormField label="N° de pièce">
            <Input
              type="text"
              value={formData.piece_number}
              onChange={(e) => setFormData({ ...formData, piece_number: e.target.value })}
              placeholder="Ex: FAC-2025-001"
            />
          </FormField>
        </div>

        {/* Avance de membre (uniquement pour les depenses) */}
        {formData.type === 'expense' && (
          <div className="border-2 border-purple-500/30 rounded p-4 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-3">
              <Checkbox
                id="paid-by-member-checkbox-edit"
                checked={formData.paid_by_member}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  paid_by_member: e.target.checked,
                  reimbursement_status: e.target.checked ? 'pending' : 'not_required'
                })}
                className="w-4 h-4 rounded border-2 border-border-custom bg-zinc-100 dark:bg-zinc-800 checked:bg-purple-500"
              />
              <Label
                htmlFor="paid-by-member-checkbox-edit"
                className="font-label text-[10px] uppercase tracking-widest text-foreground cursor-pointer"
              >
                💰 Avance personnelle d'un membre
              </Label>
            </div>
            
            {formData.paid_by_member && (
              <div className="space-y-3 mt-3">
                <FormField label="Nom du membre" required={formData.paid_by_member}>
                  <Input
                    type="text"
                    value={formData.member_name}
                    onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                    placeholder="Ex: Marie Dupont"
                    required={formData.paid_by_member}
                  />
                </FormField>
                
                <Select
                  label="Statut du remboursement"
                  value={formData.reimbursement_status}
                  onChange={(e) => setFormData({ ...formData, reimbursement_status: e.target.value as any })}
                  options={[
                    { value: 'pending', label: '⏳ En attente de remboursement' },
                    { value: 'reimbursed', label: '✅ Rembourse' },
                  ]}
                />
                
                <FormField label="Notes sur le remboursement">
                  <Textarea
                    value={formData.reimbursement_notes}
                    onChange={(e) => setFormData({ ...formData, reimbursement_notes: e.target.value })}
                    rows={2}
                    placeholder="Ex: A rembourser début de mois prochain"
                  />
                </FormField>
                
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Cette transaction sera marquee comme necessitant un remboursement. 
                    N'oubliez pas de creer une transaction de remboursement une fois effectue.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TVA */}
        <div className="border-2 border-border-custom rounded p-4">
          <div className="flex items-center gap-3 mb-3">
            <Checkbox
              id="vat-checkbox-edit"
              checked={formData.vat_applicable}
              onChange={(e) => setFormData({ ...formData, vat_applicable: e.target.checked })}
              className="w-4 h-4 rounded border-2 border-border-custom bg-zinc-100 dark:bg-zinc-800 checked:bg-accent"
            />
            <Label
              htmlFor="vat-checkbox-edit"
              className="font-label text-[10px] uppercase tracking-widest text-foreground cursor-pointer"
            >
              TVA applicable
            </Label>
          </div>
          {formData.vat_applicable && (
            <div className="space-y-3">
              <Select
                label="Taux de TVA (%)"
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                options={[
                  { value: '20', label: '20%' },
                  { value: '10', label: '10%' },
                  { value: '5.5', label: '5.5%' },
                  { value: '2.1', label: '2.1%' },
                ]}
              />
              {formData.amount && (
                <p className="font-body text-sm text-zinc-500">
                  Montant HT : {(parseFloat(formData.amount) / (1 + parseFloat(formData.vat_rate) / 100)).toFixed(2)} EUR
                </p>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <FormField label="Notes">
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Notes optionnelles..."
          />
        </FormField>

        {/* Statut */}
        <Select
          label="Statut"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          options={[
            { value: 'pending', label: 'En attente' },
            { value: 'validated', label: 'Valide' },
            { value: 'reconciled', label: 'Rapproche' },
          ]}
        />

        {/* Tags */}
        <div>
          <FormLabel>
            Tags
          </FormLabel>
          <TagMultiSelect
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            placeholder="Rechercher ou creer un tag..."
          />
        </div>
      </form>
    </>
  )

  const footerContent = (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      <Button
        variant="outline"
        size="sm"
        onClick={onClose}
        disabled={loading}
        type="button"
      >
        Annuler
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit(e)
        }}
        disabled={loading || updateTags.isLoading}
        type="submit"
      >
        {loading || updateTags.isLoading ? 'Modification...' : 'Enregistrer'}
      </Button>
    </div>
  )

  if (renderAsPanel) {
    return (
      <>
        {formContent}
        {footerContent}
      </>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier la transaction"
      size="lg"
      scrollable={true}
    >
      {formContent}
      <ModalFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
          type="button"
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
          disabled={loading || updateTags.isLoading}
          type="submit"
        >
          {loading || updateTags.isLoading ? 'Modification...' : 'Enregistrer les modifications'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

