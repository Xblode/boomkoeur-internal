'use client'

import { useState, useEffect, useMemo } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Button } from '@/components/ui/atoms'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms'
import { Edit, Trash2, Repeat, Power, ChevronDown, ChevronUp, Receipt, Plus, MoreVertical } from 'lucide-react'
import type { Transaction, RecurringTransaction } from '@/types/finance'
import EditTransactionModal from '../modals/EditTransactionModal'
import ViewTransactionModal from '../modals/ViewTransactionModal'
import { EventPicker } from './EventPicker'
import { ContactPicker } from './ContactPicker'
import { LinkEventModal } from '../modals/LinkEventModal'
import { useEvents } from '@/hooks/useEvents'
import { useCommercialContacts } from '@/hooks/useCommercialContacts'
import {
  getRecurringTransactions,
  toggleRecurringTransactionActive,
  deleteRecurringTransaction,
  generateRecurringTransactions,
} from '@/lib/stubs/supabase-stubs'
import {
  LoadingState,
  TablePagination,
  EmptyState,
} from '@/components/feature/Backend/Finance/shared/components'
import { Badge } from '@/components/ui/atoms'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms'
import { DatePicker, SelectPicker } from '@/components/ui/molecules'
import { cn } from '@/lib/utils'
import { useDetailPanel } from '@/components/providers/DetailPanelProvider'
import type { TransactionCategory } from '@/types/finance'

type SortColumn = 'date' | 'type' | 'label' | 'category' | 'amount'

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
  onError?: (error: string | null) => void
  refreshTrigger?: number
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
  onCreateTransaction,
  onError,
  refreshTrigger,
}: TransactionsTabProps) {
  const selectedYear = externalSelectedYear !== undefined ? externalSelectedYear : undefined

  const searchQuery = externalSearchQuery
  const filterType = externalFilterType
  const filterCategory = externalFilterCategory
  const filterStatus = externalFilterStatus
  const filterEventId = externalFilterEventId
  const filterProjectId = externalFilterProjectId
  const filterContactId = externalFilterContactId

  const [showViewTransactionModal, setShowViewTransactionModal] = useState(false)
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [showRecurringSection, setShowRecurringSection] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { setDetailPanel } = useDetailPanel()

  const [sortBy, setSortBy] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { events: allEvents } = useEvents()
  const { contacts: allContacts } = useCommercialContacts()
  const linksData = useMemo(() => {
    const eventsMap: Record<string, { id: string; title: string }> = {}
    const contactsMap: Record<string, { id: string; name: string }> = {}
    allEvents.forEach((e) => { eventsMap[e.id] = { id: e.id, title: e.name } })
    allContacts.forEach((c) => { contactsMap[c.id] = { id: c.id, name: c.name } })
    return { events: eventsMap, projects: {}, contacts: contactsMap }
  }, [allEvents, allContacts])

  const [showLinkEventModal, setShowLinkEventModal] = useState(false)
  const [linkingTransactionId, setLinkingTransactionId] = useState<string | null>(null)
  const [linkingField, setLinkingField] = useState<'event' | 'contact' | null>(null)
  const [categoriesIncome, setCategoriesIncome] = useState<TransactionCategory[]>([])
  const [categoriesExpense, setCategoriesExpense] = useState<TransactionCategory[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadTransactions()
    loadRecurringTransactions()
    setCurrentPage(1)
  }, [selectedYear, refreshTrigger])

  useEffect(() => {
    financeDataService.getTransactionCategories('income').then(setCategoriesIncome).catch(() => setCategoriesIncome([]))
    financeDataService.getTransactionCategories('expense').then(setCategoriesExpense).catch(() => setCategoriesExpense([]))
  }, [])

  async function loadTransactions() {
    try {
      setLoading(true)
      setError(null)
      onError?.(null)
      const data = await financeDataService.getTransactions(selectedYear)
      setTransactions(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const errorMsg = msg || 'Erreur lors du chargement des transactions'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Erreur lors du chargement des transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadRecurringTransactions() {
    try {
      const data = await getRecurringTransactions()
      setRecurringTransactions(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement des transactions récurrentes'
      setError((prev) => {
        const next = prev || msg
        onError?.(next)
        return next
      })
      console.error('Erreur lors du chargement des transactions recurrentes:', err)
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

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

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

    if (filterType !== 'all') filtered = filtered.filter((t) => t.type === filterType)
    if (filterCategory !== 'all') filtered = filtered.filter((t) => t.category === filterCategory)
    if (filterStatus !== 'all') filtered = filtered.filter((t) => t.status === filterStatus)
    if (filterEventId !== 'all') filtered = filtered.filter((t) => t.event_id === filterEventId)
    if (filterContactId !== 'all') filtered = filtered.filter((t) => t.contact_id === filterContactId)

    return filtered
  }, [transactions, searchQuery, filterType, filterCategory, filterStatus, filterEventId, filterContactId])

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const sortedTransactions = useMemo(() => {
    if (!sortBy) return filteredTransactions
    const dir = sortDirection === 'asc' ? 1 : -1
    const getValue = (t: Transaction) => {
      switch (sortBy) {
        case 'date':
          return new Date(t.date).getTime()
        case 'type':
          return t.type
        case 'label':
          return (t.label || '').toLowerCase()
        case 'category':
          return (t.category || '').toLowerCase()
        case 'amount':
          return t.amount ?? 0
        default:
          return ''
      }
    }
    return [...filteredTransactions].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (typeof va === 'number' && typeof vb === 'number') return dir * (va - vb)
      return dir * String(va).localeCompare(String(vb))
    })
  }, [filteredTransactions, sortBy, sortDirection])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedTransactions, currentPage])

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)

  const handleLinkEvent = async (transactionId: string, eventId: string) => {
    try {
      await financeDataService.updateTransaction(transactionId, { event_id: eventId })
      await loadTransactions()
      onTransactionChange?.()
    } catch (error) {
      console.error('Erreur lors de la liaison:', error)
    }
  }

  const handleUnlinkEvent = async (transactionId: string) => {
    try {
      await financeDataService.updateTransaction(transactionId, { event_id: undefined })
      await loadTransactions()
      onTransactionChange?.()
    } catch (error) {
      console.error('Erreur lors de la déliaison:', error)
    }
  }

  const handleLinkContact = async (transactionId: string, contactId: string) => {
    try {
      await financeDataService.updateTransaction(transactionId, { contact_id: contactId })
      await loadTransactions()
      onTransactionChange?.()
    } catch (error) {
      console.error('Erreur lors de la liaison:', error)
    }
  }

  const handleUnlinkContact = async (transactionId: string) => {
    try {
      await financeDataService.updateTransaction(transactionId, { contact_id: undefined })
      await loadTransactions()
      onTransactionChange?.()
    } catch (error) {
      console.error('Erreur lors de la déliaison:', error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setDetailPanel({
      title: transaction.label || 'Détail transaction',
      content: (
        <EditTransactionModal
          isOpen={true}
          onClose={() => setDetailPanel(null)}
          onSuccess={() => {
            loadTransactions()
            onTransactionChange?.()
            setDetailPanel(null)
          }}
          transaction={transaction}
          renderAsPanel
        />
      ),
      onClose: () => setDetailPanel(null),
    })
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

  const updateDate = async (t: Transaction, date: Date | undefined) => {
    if (!date) return
    try {
      await financeDataService.updateTransaction(t.id, { date: date.toISOString().split('T')[0] })
      await loadTransactions()
      onTransactionChange?.()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const updateCategory = async (t: Transaction, category: string) => {
    try {
      await financeDataService.updateTransaction(t.id, { category: category || '' })
      await loadTransactions()
      onTransactionChange?.()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const updateStatus = async (t: Transaction, status: 'pending' | 'validated' | 'reconciled') => {
    try {
      await financeDataService.updateTransaction(t.id, { status })
      await loadTransactions()
      onTransactionChange?.()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const updateType = async (t: Transaction, type: 'income' | 'expense') => {
    try {
      await financeDataService.updateTransaction(t.id, { type })
      await loadTransactions()
      onTransactionChange?.()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const STATUS_BADGE_VARIANT: Record<string, 'warning' | 'success' | 'secondary'> = {
    pending: 'warning',
    validated: 'success',
    reconciled: 'secondary',
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Valide'
      case 'reconciled':
        return 'Rapproché'
      default:
        return 'En attente'
    }
  }

  const getCategoryStyle = (category?: string) => {
    if (!category)
      return 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'

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

  if (loading) {
    return <LoadingState message="Chargement des transactions..." className="h-96" />
  }

  const allSelected =
    paginatedTransactions.length > 0 && selectedIds.size === paginatedTransactions.length

  return (
    <div className="space-y-6">
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
              {showRecurringSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleGenerateRecurring}>
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
                      <Badge variant={rt.is_active ? 'success' : 'secondary'}>
                        {rt.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {rt.amount.toFixed(2)} EUR • {rt.category} •{' '}
                      {rt.frequency === 'monthly' ? 'Mensuel' : rt.frequency === 'quarterly' ? 'Trimestriel' : 'Annuel'}{' '}
                      • Jour {rt.day_of_month}
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

      {paginatedTransactions.length === 0 ? (
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
      ) : (
        <div className="rounded-xl overflow-visible">
          <Table
            variant="default"
            resizable={false}
            statusColumn={false}
            fillColumn={false}
            selectionColumn
            addable={!!onCreateTransaction}
            onAddRow={onCreateTransaction ? (_values) => onCreateTransaction() : undefined}
            selectAllChecked={allSelected}
            onSelectAllChange={(checked) =>
              setSelectedIds(checked ? new Set(paginatedTransactions.map((t) => t.id)) : new Set())
            }
          >
            <TableHeader>
              <TableRow hoverCellOnly>
                <TableHead minWidth={200} defaultWidth={290} sortable onSortClick={() => handleSort('label')}>
                  Libellé
                </TableHead>
                <TableHead minWidth={90} defaultWidth={105} sortable onSortClick={() => handleSort('date')}>
                  Date
                </TableHead>
                <TableHead minWidth={100} defaultWidth={110} sortable onSortClick={() => handleSort('type')}>
                  Type
                </TableHead>
                <TableHead minWidth={120} defaultWidth={140} sortable onSortClick={() => handleSort('category')}>
                  Catégorie
                </TableHead>
                <TableHead minWidth={130} defaultWidth={160}>
                  Événement
                </TableHead>
                <TableHead minWidth={100} defaultWidth={120}>
                  Contact
                </TableHead>
                <TableHead minWidth={90} defaultWidth={110} align="center" sortable onSortClick={() => handleSort('amount')}>
                  Montant
                </TableHead>
                <TableHead minWidth={85} defaultWidth={135} align="center">
                  Statut
                </TableHead>
                <TableHead align="center" centerContent minWidth={48} defaultWidth={48} maxWidth={48}>
                  +
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((t) => (
                  <TableRow
                    key={t.id}
                    selected={selectedIds.has(t.id)}
                    onSelectChange={(checked) =>
                      setSelectedIds((prev) => {
                        const next = new Set(prev)
                        if (checked) next.add(t.id)
                        else next.delete(t.id)
                        return next
                      })
                    }
                  >
                    <TableCell
                      noHoverBorder
                      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      onClick={() => handleEdit(t)}
                    >
                      <div className="flex items-center justify-between gap-2 h-full group/row">
                        <div className="truncate min-w-0 flex-1">
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{t.label}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {t.piece_number && (
                              <span className="text-[10px] text-zinc-400 font-mono">#{t.piece_number}</span>
                            )}
                            {t.paid_by_member && t.member_name && (
                              <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                <span>👤</span> {t.member_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(t)
                            }}
                            className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-0">
                      <div className="w-full h-full min-h-8 flex items-center">
                        <DatePicker
                          date={t.date ? new Date(t.date) : undefined}
                          onSelect={(d) => updateDate(t, d)}
                          placeholder="Date"
                          displayFormat="dd/MM/yyyy"
                          variant="text"
                          className="h-8 min-h-8 w-full text-xs"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-0">
                      <SelectPicker
                        variant="table"
                        size="xs"
                        value={t.type}
                        onChange={(v) => updateType(t, v as 'income' | 'expense')}
                        options={[
                          { value: 'income', label: 'Entrée' },
                          { value: 'expense', label: 'Sortie' },
                        ]}
                        placeholder="Type"
                        className="w-full h-8 min-h-8"
                      />
                    </TableCell>
                    <TableCell className="p-0">
                      <SelectPicker
                        variant="table"
                        size="xs"
                        value={t.category || ''}
                        onChange={(v) => updateCategory(t, v)}
                        options={[
                          { value: '', label: 'Catégorie' },
                          ...(t.type === 'income' ? categoriesIncome : categoriesExpense).map((c) => ({
                            value: c.name,
                            label: c.name,
                          })),
                        ]}
                        placeholder="Catégorie"
                        searchable
                        searchPlaceholder="Rechercher une catégorie..."
                        className="w-full h-8 min-h-8"
                      />
                    </TableCell>
                    <TableCell className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <EventPicker
                        value={t.event_id}
                        onSelect={(eventId) => handleLinkEvent(t.id, eventId)}
                        onUnlink={() => handleUnlinkEvent(t.id)}
                      >
                        {!t.event_id ? (
                          <span className="text-sm text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
                            + Événement
                          </span>
                        ) : (
                          (() => {
                            const event = linksData.events[t.event_id]
                            if (!event) return <span className="text-sm text-zinc-400">-</span>
                            return (
                              <span
                                className="text-sm text-zinc-900 dark:text-zinc-100 truncate block"
                                title={event.title}
                              >
                                {event.title}
                              </span>
                            )
                          })()
                        )}
                      </EventPicker>
                    </TableCell>
                    <TableCell className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <ContactPicker
                        value={t.contact_id}
                        onSelect={(contactId) => handleLinkContact(t.id, contactId)}
                        onUnlink={() => handleUnlinkContact(t.id)}
                      >
                        {!t.contact_id ? (
                          <span className="text-sm text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400">
                            + Contact
                          </span>
                        ) : (
                          (() => {
                            const contact = linksData.contacts[t.contact_id]
                            if (!contact) return <span className="text-sm text-zinc-400">-</span>
                            return (
                              <span
                                className="text-sm text-zinc-900 dark:text-zinc-100 truncate block"
                                title={contact.name}
                              >
                                {contact.name}
                              </span>
                            )
                          })()
                        )}
                      </ContactPicker>
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={cn(
                          'font-mono font-bold text-sm whitespace-nowrap',
                          t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-zinc-100'
                        )}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {(t.amount || 0).toLocaleString('fr-FR')} €
                      </span>
                    </TableCell>
                    <TableCell align="center" className="p-0">
                      <SelectPicker
                        variant="table"
                        size="xs"
                        value={t.status}
                        onChange={(v) => updateStatus(t, v as 'pending' | 'validated' | 'reconciled')}
                        options={[
                          { value: 'pending', label: 'En attente' },
                          { value: 'validated', label: 'Valide' },
                          { value: 'reconciled', label: 'Rapproché' },
                        ]}
                        placeholder="Statut"
                        className="w-full h-8 min-h-8"
                      />
                    </TableCell>
                    <TableCell noHoverBorder className="p-0 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full h-full min-h-8 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                            title="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(t)}
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Supprimer
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedTransactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <ViewTransactionModal
        isOpen={showViewTransactionModal}
        onClose={() => {
          setShowViewTransactionModal(false)
          setViewingTransaction(null)
        }}
        transaction={viewingTransaction}
        onEdit={(transaction) => {
          setShowViewTransactionModal(false)
          setViewingTransaction(null)
          handleEdit(transaction)
        }}
      />

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

    </div>
  )
}
