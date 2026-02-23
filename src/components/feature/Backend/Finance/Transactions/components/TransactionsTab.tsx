'use client'

import { useState, useEffect, useMemo } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Button } from '@/components/ui/atoms'
import { Select } from '@/components/ui/atoms'
import { Edit, Trash2, Repeat, Power, ChevronDown, ChevronUp, Receipt, Plus } from 'lucide-react'
import type { Transaction, RecurringTransaction } from '@/types/finance'
import EditTransactionModal from '../modals/EditTransactionModal'
import ViewTransactionModal from '../modals/ViewTransactionModal'
import { LinkEventModal } from '../modals/LinkEventModal'
import { LinkContactModal } from '../modals/LinkContactModal'
import { Link2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { 
  useTransactionLinks, 
  getRecurringTransactions,
  toggleRecurringTransactionActive,
  deleteRecurringTransaction,
  generateRecurringTransactions 
} from '@/lib/stubs/supabase-stubs'
import {
  LoadingState,
  SectionHeader,
  DataTable,
  Column,
  TablePagination,
  StatusBadge,
  ActionButtons,
  EmptyState
} from '@/components/feature/Backend/Finance/shared/components'

interface TransactionsTabProps {
  selectedYear?: number
  searchQuery?: string
  filterType?: 'all' | 'income' | 'expense'
  filterCategory?: string
  filterStatus?: 'all' | 'pending' | 'validated' | 'reconciled'
  filterEventId?: string
  filterProjectId?: string
  filterContactId?: string
  onTransactionChange?: () => void
  onCreateTransaction?: () => void
}

export default function TransactionsTab({ 
  selectedYear: externalSelectedYear, 
  searchQuery: externalSearchQuery = '',
  filterType: externalFilterType = 'all',
  filterCategory: externalFilterCategory = 'all',
  filterStatus: externalFilterStatus = 'all',
  filterEventId: externalFilterEventId = 'all',
  filterProjectId: externalFilterProjectId = 'all',
  filterContactId: externalFilterContactId = 'all',
  onTransactionChange,
  onCreateTransaction
}: TransactionsTabProps) {
  // Par defaut, afficher toutes les annees (undefined)
  const selectedYear = externalSelectedYear !== undefined ? externalSelectedYear : undefined
  
  // Utiliser les filtres externes
  const searchQuery = externalSearchQuery
  const filterType = externalFilterType
  const filterCategory = externalFilterCategory
  const filterStatus = externalFilterStatus
  const filterEventId = externalFilterEventId
  const filterProjectId = externalFilterProjectId
  const filterContactId = externalFilterContactId
  
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false)
  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [showRecurringSection, setShowRecurringSection] = useState(false)

  // Charger les liens (events, contacts) pour toutes les transactions
  const transactionIds = useMemo(() => transactions.map((t) => t.id), [transactions])
  const { data: linksData = { events: {}, projects: {}, contacts: {} } } = useTransactionLinks(transactionIds)
  
  const router = useRouter()
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showLinkEventModal, setShowLinkEventModal] = useState(false)
  const [showLinkContactModal, setShowLinkContactModal] = useState(false)
  const [linkingTransactionId, setLinkingTransactionId] = useState<string | null>(null)
  const [linkingField, setLinkingField] = useState<'event' | 'contact' | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadTransactions()
    loadRecurringTransactions()
    setCurrentPage(1)
  }, [selectedYear])

  async function loadTransactions() {
    try {
      setLoading(true)
      const data = await financeDataService.getTransactions(selectedYear)
      console.log(`📊 Transactions chargees: ${data?.length || 0} transactions${selectedYear ? ` pour l'annee ${selectedYear}` : ' (toutes annees)'}`)
      setTransactions(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadRecurringTransactions() {
    try {
      const data = await getRecurringTransactions()
      setRecurringTransactions(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des transactions recurrentes:', error)
    }
  }

  async function handleToggleRecurring(id: string) {
    try {
      await toggleRecurringTransactionActive(id)
      await loadRecurringTransactions()
      await loadTransactions()
      if (onTransactionChange) onTransactionChange()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
    }
  }

  async function handleDeleteRecurring(id: string) {
    if (!confirm('Etes-vous sûr de vouloir supprimer cette transaction recurrente ?')) return
    
    try {
      await deleteRecurringTransaction(id)
      await loadRecurringTransactions()
      if (onTransactionChange) onTransactionChange()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  async function handleGenerateRecurring() {
    try {
      const count = await generateRecurringTransactions()
      alert(`${count} transaction(s) recurrente(s) generee(s)`)
      await loadTransactions()
      await loadRecurringTransactions()
      if (onTransactionChange) onTransactionChange()
    } catch (error) {
      console.error('Erreur lors de la generation:', error)
      alert('Erreur lors de la generation des transactions recurrentes')
    }
  }


  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.label?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query) ||
          t.piece_number?.toLowerCase().includes(query) ||
          t.notes?.toLowerCase().includes(query)
      )
    }

    // Filtres
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType)
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory)
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }
    if (filterEventId !== 'all') {
      filtered = filtered.filter((t) => t.event_id === filterEventId)
    }
    if (filterContactId !== 'all') {
      filtered = filtered.filter((t) => t.contact_id === filterContactId)
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal: any = (a as any)[sortField]
      let bVal: any = (b as any)[sortField]
      
      if (sortField === 'date') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [transactions, searchQuery, filterType, filterCategory, filterStatus, filterEventId, filterContactId, sortField, sortDirection])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedTransactions, currentPage])

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)

  
  const handleLinkEvent = async (transactionId: string, eventId: string) => {
    try {
      await financeDataService.updateTransaction(transactionId, { event_id: eventId })
      await loadTransactions()
      setShowLinkEventModal(false)
      setLinkingTransactionId(null)
      setLinkingField(null)
    } catch (error) {
      console.error('Erreur lors de la liaison:', error)
    }
  }

  const handleLinkContact = async (transactionId: string, contactId: string) => {
    try {
      await financeDataService.updateTransaction(transactionId, { contact_id: contactId })
      await loadTransactions()
      setShowLinkContactModal(false)
      setLinkingTransactionId(null)
      setLinkingField(null)
    } catch (error) {
      console.error('Erreur lors de la liaison:', error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowEditTransactionModal(true)
  }

  const handleDelete = async (transaction: Transaction) => {
    if (confirm('Etes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await financeDataService.deleteTransaction(transaction.id!)
        await loadTransactions()
        onTransactionChange?.()
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
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

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Entree' : 'Sortie'
  }

  const getTypeVariant = (type: string) => {
    return type === 'income' ? 'success' : 'danger'
  }

  const getCategoryStyle = (category?: string) => {
    if (!category) return 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
    
    const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
    const styles = [
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800',
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
    ]
    return styles[hash % styles.length]
  }

  const tableColumns: Column<Transaction>[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      width: 'w-auto',
      render: (t) => (
        <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">
          {new Date(t.date).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: 'w-auto',
      render: (t) => (
        <StatusBadge
          label={getTypeLabel(t.type)}
          variant={getTypeVariant(t.type)}
          className="px-2 py-0.5 text-[10px] uppercase tracking-wide"
          showIcon={false}
        />
      ),
    },
    {
      key: 'label',
      label: 'Libelle',
      sortable: true,
      width: 'w-full',
      render: (t) => (
        <div className="flex items-center justify-between gap-2 h-full group/row">
          <div className="truncate min-w-0">
            <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{t.label}</div>
            <div className="flex items-center gap-2 mt-0.5">
              {t.piece_number && <span className="text-[10px] text-zinc-400 font-mono">#{t.piece_number}</span>}
              {t.paid_by_member && t.member_name && (
                <span className="text-[10px] text-purple-400 flex items-center gap-1">
                  <span>👤</span> {t.member_name}
                </span>
              )}
            </div>
          </div>
          {hoveredRow === t.id && (
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(t)}
                className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                title="Modifier"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(t)}
                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categorie',
      sortable: true,
      width: 'w-auto',
      render: (t) => (
        t.category ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium whitespace-nowrap transition-colors ${getCategoryStyle(t.category)}`}>
            {t.category}
          </span>
        ) : (
          <span className="text-xs text-zinc-400 whitespace-nowrap">-</span>
        )
      ),
    },
    {
      key: 'bank_account_id',
      label: 'Compte',
      width: 'w-auto',
      render: (t) => {
        if (t.paid_by_member && t.member_name) {
          return (
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-400 whitespace-nowrap">💰 {t.member_name}</span>
              {t.reimbursement_status === 'pending' && (
                <span className="text-[10px] text-yellow-500 whitespace-nowrap">⏳ A rembourser</span>
              )}
              {t.reimbursement_status === 'reimbursed' && (
                <span className="text-[10px] text-green-500 whitespace-nowrap">✅ Rembourse</span>
              )}
            </div>
          )
        }
        // TODO: Afficher le nom du compte bancaire
        return (
          <span className="text-xs text-zinc-400 whitespace-nowrap">-</span>
        )
      },
    },
    {
      key: 'event',
      label: 'Evenement',
      width: 'w-auto',
      render: (t) => {
        if (!t.event_id) {
          return (
            <div className="flex items-center gap-1 group/cell">
              <span className="text-xs text-zinc-400">-</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover/cell:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                onClick={(e) => {
                  e.stopPropagation()
                  setLinkingTransactionId(t.id)
                  setLinkingField('event')
                  setShowLinkEventModal(true)
                }}
                title="Lier a un evenement"
              >
                <Link2 className="w-3 h-3" />
              </Button>
            </div>
          )
        }
        const event = linksData.events[t.event_id]
        if (!event) return <span className="text-xs text-zinc-400">-</span>
        return (
          <span 
            className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 hover:underline cursor-pointer truncate max-w-[150px] block"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/evenements?id=${event.id}`)
            }}
            title={event.title}
          >
            {event.title}
          </span>
        )
      },
    },
    {
      key: 'contact',
      label: 'Contact',
      width: 'w-auto',
      render: (t) => {
        if (!t.contact_id) {
          return (
            <div className="flex items-center gap-1 group/cell">
              <span className="text-xs text-zinc-400">-</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover/cell:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                onClick={(e) => {
                  e.stopPropagation()
                  setLinkingTransactionId(t.id)
                  setLinkingField('contact')
                  setShowLinkContactModal(true)
                }}
                title="Lier a un contact"
              >
                <Link2 className="w-3 h-3" />
              </Button>
            </div>
          )
        }
        const contact = linksData.contacts[t.contact_id]
        if (!contact) return <span className="text-xs text-zinc-400">-</span>
        return (
          <span 
            className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 hover:underline cursor-pointer truncate max-w-[150px] block"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/commerciale?contact=${contact.id}`)
            }}
            title={contact.name}
          >
            {contact.name}
          </span>
        )
      },
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      width: 'w-auto',
      align: 'right',
      render: (t) => (
        <span className={`font-mono font-bold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {t.type === 'income' ? '+' : '-'}{(t.amount || 0).toLocaleString('fr-FR')} €
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: 'w-auto',
      align: 'right',
      render: (t) => (
        <StatusBadge
          label={getStatusLabel(t.status)}
          variant={getStatusVariant(t.status)}
          className="px-2 py-0.5 text-[10px]"
          showIcon={true}
        />
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Chargement des transactions..." className="h-96" />
  }

  return (
    <div className="space-y-6">

      {/* Section Transactions recurrentes */}
      {recurringTransactions.length > 0 && (
        <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecurringSection(!showRecurringSection)}
              className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-foreground hover:text-blue-400 transition-colors justify-start"
            >
              <Repeat className="w-4 h-4" />
              Transactions recurrentes ({recurringTransactions.length})
              {showRecurringSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateRecurring}
            >
              Generer maintenant
            </Button>
          </div>

          {showRecurringSection && (
            <div className="space-y-2 mt-4">
              {recurringTransactions.map((rt) => (
                <div
                  key={rt.id}
                  className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded border border-border-custom hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{rt.label}</span>
                      <StatusBadge
                        label={rt.is_active ? 'Active' : 'Inactive'}
                        variant={rt.is_active ? 'success' : 'neutral'}
                      />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {rt.amount.toFixed(2)} EUR • {rt.category} • {rt.frequency === 'monthly' ? 'Mensuel' : rt.frequency === 'quarterly' ? 'Trimestriel' : 'Annuel'} • Jour {rt.day_of_month}
                      {rt.next_occurrence_date && (
                        <> • Prochaine: {new Date(rt.next_occurrence_date).toLocaleDateString('fr-FR')}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRecurring(rt.id)}
                      title={rt.is_active ? 'Desactiver' : 'Activer'}
                      className={rt.is_active ? 'text-yellow-400' : 'text-green-400'}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecurring(rt.id)}
                      title="Supprimer"
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Table */}
      <DataTable
        data={paginatedTransactions}
        columns={tableColumns}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowHover={setHoveredRow}
        onRowClick={(transaction) => {
          setViewingTransaction(transaction)
          setShowViewTransactionModal(true)
        }}
        emptyMessage="Aucune transaction a afficher"
        emptyState={
          <EmptyState
            icon={Receipt}
            title="Aucune transaction"
            description="Commencez par ajouter votre premiere transaction ou importez un fichier CSV."
            action={
              onCreateTransaction && (
                <Button variant="primary" size="sm" onClick={onCreateTransaction}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle transaction
                </Button>
              )
            }
          />
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAndSortedTransactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modals */}
      <EditTransactionModal
        isOpen={showEditTransactionModal}
        onClose={() => {
          setShowEditTransactionModal(false)
          setEditingTransaction(null)
        }}
        onSuccess={() => {
          loadTransactions()
          onTransactionChange?.()
        }}
        transaction={editingTransaction}
      />

      <ViewTransactionModal
        isOpen={showViewTransactionModal}
        onClose={() => {
          setShowViewTransactionModal(false)
          setViewingTransaction(null)
        }}
        transaction={viewingTransaction}
        onEdit={(transaction) => {
          setEditingTransaction(transaction)
          setShowEditTransactionModal(true)
        }}
      />

      {/* Modals pour lier des entites */}
      {linkingTransactionId && linkingField === 'event' && (
        <LinkEventModal
          isOpen={showLinkEventModal}
          onClose={() => {
            setShowLinkEventModal(false)
            setLinkingTransactionId(null)
            setLinkingField(null)
          }}
          transactionId={linkingTransactionId}
          onLink={async (eventId: string) => {
            await handleLinkEvent(linkingTransactionId, eventId)
          }}
        />
      )}

      {linkingTransactionId && linkingField === 'contact' && (
        <LinkContactModal
          isOpen={showLinkContactModal}
          onClose={() => {
            setShowLinkContactModal(false)
            setLinkingTransactionId(null)
            setLinkingField(null)
          }}
          transactionId={linkingTransactionId}
          onLink={async (contactId: string) => {
            await handleLinkContact(linkingTransactionId, contactId)
          }}
        />
      )}
    </div>
  )
}
