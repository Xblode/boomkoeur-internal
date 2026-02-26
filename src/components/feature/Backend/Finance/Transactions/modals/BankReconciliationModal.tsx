'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { useTransactions } from '@/hooks'
import { Modal, ModalFooter } from '@/components/ui/organisms'
import { Button, Input, Select } from '@/components/ui/atoms'
import { EmptyState, LoadingState } from '@/components/ui/molecules'
import { CheckCheck, Search } from 'lucide-react'
import type { Transaction } from '@/types/finance'
import { cn } from '@/lib/utils'

interface BankReconciliationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  selectedYear?: number
}

export default function BankReconciliationModal({
  isOpen,
  onClose,
  onSuccess,
  selectedYear = new Date().getFullYear(),
}: BankReconciliationModalProps) {
  const queryClient = useQueryClient()
  const { transactions = [], isLoading: loading } = useTransactions(selectedYear, { enabled: isOpen })
  const [isReconcilingAll, setIsReconcilingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'validated'>('validated')

  const invalidateFinance = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['financeKPIs'] })
  }

  const handleReconcile = async (transactionId: string) => {
    try {
      await financeDataService.reconcileTransaction(transactionId)
      invalidateFinance()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors du rapprochement:', error)
      alert('Erreur lors du rapprochement')
    }
  }

  const handleReconcileAll = async () => {
    if (!confirm('Rapprocher toutes les transactions validees ?')) return

    try {
      setIsReconcilingAll(true)
      const toReconcile = filteredTransactions.filter(
        (t) => t.status === 'validated' && !t.reconciled
      )

      for (const transaction of toReconcile) {
        await financeDataService.reconcileTransaction(transaction.id)
      }

      invalidateFinance()
      onSuccess?.()
    } catch (error) {
      console.error('Erreur lors du rapprochement:', error)
      alert('Erreur lors du rapprochement')
    } finally {
      setIsReconcilingAll(false)
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus === 'validated' && t.status !== 'validated') return false
    if (filterStatus === 'pending' && t.status !== 'pending') return false
    if (t.reconciled) return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        t.label.toLowerCase().includes(query) ||
        t.entry_number?.toLowerCase().includes(query) ||
        t.piece_number?.toLowerCase().includes(query)
      )
    }

    return true
  })

  const pendingCount = transactions.filter((t) => t.status === 'validated' && !t.reconciled).length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rapprochement bancaire"
      size="lg"
      scrollable
    >
      <div className="space-y-6">
        {/* Informations */}
        <div className="p-4 bg-background-tertiary border-2 border-border-custom rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Transactions a rapprocher</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{pendingCount}</p>
            </div>
            {pendingCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleReconcileAll}
                disabled={loading || isReconcilingAll}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Tout rapprocher
              </Button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Rechercher une transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-[38px]"
            />
          </div>
          <div className="w-48">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              options={[
                { value: 'all', label: 'Toutes' },
                { value: 'validated', label: 'Validees' },
                { value: 'pending', label: 'En attente' },
              ]}
              className="h-[38px]"
            />
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading || isReconcilingAll ? (
            <LoadingState message="Chargement..." />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              title="Aucune transaction à rapprocher"
              variant="compact"
            />
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={cn(
                  'p-4 border-2 border-border-custom rounded-lg hover:border-accent/50 transition-all',
                  transaction.reconciled && 'opacity-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-zinc-900 dark:text-zinc-50">{transaction.entry_number}</span>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-heading uppercase rounded border',
                          transaction.type === 'income'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border-red-500/50'
                        )}
                      >
                        {transaction.type === 'income' ? 'Entree' : 'Sortie'}
                      </span>
                      {transaction.status === 'validated' && (
                        <span className="px-2 py-1 text-xs font-heading uppercase rounded border bg-green-500/20 text-green-400 border-green-500/50">
                          Validee
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-sm mb-1">{transaction.label}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')} •{' '}
                      {transaction.category}
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div
                      className={cn(
                        'text-lg font-mono font-bold',
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {transaction.amount.toLocaleString('fr-FR')} EUR
                    </div>
                  </div>
                  {!transaction.reconciled && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReconcile(transaction.id)}
                      disabled={loading || isReconcilingAll}
                    >
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Rapprocher
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading || isReconcilingAll}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  )
}

