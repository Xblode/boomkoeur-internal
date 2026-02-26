'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { useBankAccounts, useTransactionCategories } from '@/hooks'
import { Modal, ModalFooter, Button, Input, Select, Textarea, Label, Checkbox, FormLabel } from '@/components/ui'
import { FormField } from '@/components/ui/molecules'
import type { TransactionCategory, BankAccount } from '@/types/finance'

// TODO: Connecter aux vraies donnees du projet
type Event = { id: string; title: string; date?: string }

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventId?: string // Pre-remplir event_id si creation depuis un Event
  contactId?: string // Pre-remplir contact_id si creation depuis un Contact
  projectId?: string // Pre-remplir project_id si creation depuis un Projet
}

export default function NewTransactionModal({ isOpen, onClose, onSuccess, eventId, contactId, projectId }: NewTransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events] = useState<Event[]>([])

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
    event_id: '',
    contact_id: '',
    project_id: '',
    paid_by_member: false,
    member_name: '',
    reimbursement_status: 'not_required' as 'not_required' | 'pending' | 'reimbursed',
    reimbursement_notes: '',
    // Transaction recurrente
    is_recurring: false,
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    day_of_month: new Date().getDate(),
    end_date: '',
  })

  const { accounts: bankAccounts } = useBankAccounts()
  const { categories } = useTransactionCategories(formData.type)

  // Pre-remplir event_id, contact_id, project_id si fournis
  useEffect(() => {
    if (isOpen && (eventId || contactId || projectId)) {
      setFormData(prev => ({
        ...prev,
        event_id: eventId || prev.event_id,
        contact_id: contactId || prev.contact_id,
        project_id: projectId || prev.project_id,
      }))
    }
  }, [isOpen, eventId, contactId, projectId])

  // Charger les evenements (TODO: implementer)
  useEffect(() => {
    if (isOpen) {
      // loadEvents - pour l'instant vide
    }
  }, [isOpen])

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
  const defaultCategories = formData.type === 'income' ? defaultIncomeCategories : defaultExpenseCategories
  const fallbackCategories = defaultCategories.map((name) => ({
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

    if (!formData.label || !formData.amount || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.is_recurring && (!formData.day_of_month || formData.day_of_month < 1 || formData.day_of_month > 31)) {
      setError('Le jour du mois doit etre entre 1 et 31')
      return
    }

    try {
      setLoading(true)

      const amount = parseFloat(formData.amount)
      const amount_excl_tax = formData.vat_applicable 
        ? amount / (1 + parseFloat(formData.vat_rate) / 100)
        : amount

      if (formData.is_recurring) {
        // TODO: Implementer les transactions recurrentes dans le service
        setError('Les transactions recurrentes ne sont pas encore implementees')
        return
      }

      // Creer une transaction normale
      await financeDataService.createTransaction({
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
        fiscal_year: new Date(formData.date).getFullYear(),
        reconciled: false,
        event_id: formData.event_id || undefined,
        contact_id: formData.contact_id || undefined,
        project_id: formData.project_id || undefined,
        paid_by_member: formData.paid_by_member,
        member_name: formData.paid_by_member ? formData.member_name : undefined,
        reimbursement_status: formData.paid_by_member ? formData.reimbursement_status : 'not_required',
        reimbursement_notes: formData.paid_by_member ? formData.reimbursement_notes : undefined,
      })

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        type: 'income',
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
        status: 'pending',
        event_id: '',
        contact_id: '',
        project_id: '',
        paid_by_member: false,
        member_name: '',
        reimbursement_status: 'not_required',
        reimbursement_notes: '',
        is_recurring: false,
        frequency: 'monthly',
        day_of_month: new Date().getDate(),
        end_date: '',
      })
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle transaction"
      size="lg"
      scrollable={true}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500 rounded">
          <p className="font-body text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
                py-3 px-4 rounded border-2 font-heading text-sm uppercase tracking-wide transition-all h-auto
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
                py-3 px-4 rounded border-2 font-heading text-sm uppercase tracking-wide transition-all h-auto
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

        {/* Categorie et Evenement */}
        <div className="grid grid-cols-2 gap-4">
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
          <Select
            label="Lier a un evenement"
            value={formData.event_id}
            onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
            options={[
              { value: '', label: 'Aucun evenement' },
              ...events.map(event => ({
                value: event.id,
                label: event.date ? `${event.title} - ${new Date(event.date).toLocaleDateString('fr-FR')}` : event.title,
              }))
            ]}
            helperText="Optionnel : pour le suivi budgetaire"
          />
        </div>

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
                id="paid-by-member-checkbox"
                checked={formData.paid_by_member}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  paid_by_member: e.target.checked,
                  reimbursement_status: e.target.checked ? 'pending' : 'not_required'
                })}
                className="w-4 h-4 rounded border-2 border-border-custom bg-zinc-100 dark:bg-zinc-800 checked:bg-purple-500"
              />
              <Label
                htmlFor="paid-by-member-checkbox"
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
              id="vat-checkbox"
              checked={formData.vat_applicable}
              onChange={(e) => setFormData({ ...formData, vat_applicable: e.target.checked })}
              className="w-4 h-4 rounded border-2 border-border-custom bg-zinc-100 dark:bg-zinc-800 checked:bg-accent"
            />
            <Label
              htmlFor="vat-checkbox"
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

        {/* Transaction recurrente */}
        <div className="border-2 border-blue-500/30 rounded p-4 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-3">
            <Checkbox
              id="recurring-checkbox"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="w-4 h-4 rounded border-2 border-border-custom bg-zinc-100 dark:bg-zinc-800 checked:bg-blue-500"
            />
            <Label
              htmlFor="recurring-checkbox"
              className="font-label text-[10px] uppercase tracking-widest text-foreground cursor-pointer"
            >
              🔄 Transaction recurrente (abonnement, etc.)
            </Label>
          </div>
          
          {formData.is_recurring && (
            <div className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Frequence *"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  options={[
                    { value: 'monthly', label: 'Mensuel' },
                    { value: 'quarterly', label: 'Trimestriel' },
                    { value: 'yearly', label: 'Annuel' },
                  ]}
                />
                <FormField label="Jour du mois *" required description="Jour où la transaction sera générée chaque mois">
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.day_of_month}
                    onChange={(e) => setFormData({ ...formData, day_of_month: parseInt(e.target.value) || 1 })}
                    required
                  />
                </FormField>
              </div>
              
              <FormField label="Date de fin (optionnel)" description="Si non renseigné, la transaction se répétera indéfiniment">
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </FormField>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-xs text-blue-400">
                  ℹ️ Une transaction recurrente generera automatiquement une nouvelle transaction chaque mois/trimestre/annee.
                  La premiere transaction sera creee immediatement a la date choisie.
                </p>
              </div>
            </div>
          )}
        </div>

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
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creation...' : 'Creer la transaction'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
