'use client'

import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'
import { Badge } from '@/components/ui/atoms'
import type { Transaction } from '@/types/finance'
import { Calendar, DollarSign, Tag, FileText, Hash, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ViewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onEdit?: (transaction: Transaction) => void
}

export default function ViewTransactionModal({
  isOpen,
  onClose,
  transaction,
  onEdit,
}: ViewTransactionModalProps) {
  if (!transaction) return null

  const getTypeLabel = (type: string) => {
    return type === 'income' ? '⬆️ Entree' : '⬇️ Sortie'
  }

  const getTypeVariant = (type: string) => {
    return type === 'income' ? 'success' : 'destructive'
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'validated': return 'success'
      case 'reconciled': return 'default'
      default: return 'warning'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated': return 'Valide'
      case 'reconciled': return 'Rapproche'
      default: return 'En attente'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Details de la transaction"
      size="lg"
    >
      <div className="space-y-6">
        {/* En-tete avec montant et type */}
        <div className="bg-background-secondary border-2 border-border-custom rounded p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Badge variant={getTypeVariant(transaction.type)} className="text-sm px-3 py-1">
              {getTypeLabel(transaction.type)}
            </Badge>
            <Badge variant={getStatusVariant(transaction.status)} className="text-sm px-3 py-1">
              {getStatusLabel(transaction.status)}
            </Badge>
          </div>
          <p className={`font-heading text-5xl font-bold ${
            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}
            {(transaction.amount || 0).toLocaleString('fr-FR')} EUR
          </p>
          <p className="font-body text-xl text-foreground mt-2">{transaction.label}</p>
        </div>

        {/* Informations detaillees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Numéro d'écriture */}
          {transaction.entry_number && (
            <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-zinc-500" />
                <p className="font-label text-xs uppercase tracking-wider text-zinc-500">Code Transaction</p>
              </div>
              <p className="font-mono text-lg text-foreground font-bold">{transaction.entry_number}</p>
            </div>
          )}

          {/* Date */}
          <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <p className="font-label text-xs uppercase tracking-wider text-zinc-500">Date</p>
            </div>
            <p className="font-mono text-lg text-foreground">
              {new Date(transaction.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Categorie */}
          {transaction.category && (
            <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-zinc-500" />
                <p className="font-label text-xs uppercase tracking-wider text-zinc-500">Categorie</p>
              </div>
              <p className="font-body text-lg text-foreground">{transaction.category}</p>
            </div>
          )}

          {/* Numero de piece */}
          {transaction.piece_number && (
            <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-zinc-500" />
                <p className="font-label text-xs uppercase tracking-wider text-zinc-500">N° de piece</p>
              </div>
              <p className="font-mono text-lg text-foreground">{transaction.piece_number}</p>
            </div>
          )}

          {/* Mode de paiement */}
          {transaction.payment_method && (
            <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <p className="font-label text-xs uppercase tracking-wider text-zinc-500">Mode de paiement</p>
              </div>
              <p className="font-body text-lg text-foreground">{transaction.payment_method}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="bg-background-secondary border-2 border-border-custom rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              <p className="font-label text-xs uppercase tracking-wider text-zinc-500">Notes</p>
            </div>
            <p className="font-body text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{transaction.notes}</p>
          </div>
        )}

        {/* Informations de rapprochement */}
        {transaction.status === 'reconciled' && transaction.reconciliation_date && (
          <div className="bg-green-500/10 border-2 border-green-500 rounded p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-heading text-sm font-bold uppercase text-green-400">Transaction rapprochee</p>
                <p className="font-body text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Rapprochee le {new Date(transaction.reconciliation_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
        {onEdit && (
          <Button variant="primary" size="sm" onClick={() => {
            onEdit(transaction)
            onClose()
          }}>
            Modifier
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

