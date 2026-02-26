'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { useInvoices } from '@/hooks'
import { Button } from '@/components/ui/atoms'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms'
import { Edit2, Download, Check, Trash2, FileText, Plus, MoreVertical } from 'lucide-react'
import type { Invoice, InvoiceLine } from '@/types/finance'
import EditInvoiceModal from '../modals/EditInvoiceModal'
import ViewInvoiceModal from '../modals/ViewInvoiceModal'
import { generateInvoicePDF } from '@/lib/utils/finance/pdf-generator'
import {
  LoadingState,
  TablePagination,
  EmptyState,
  ConfirmDeleteModal,
} from '../../shared/components'
import { Badge, Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms'
import { SelectPicker } from '@/components/ui/molecules'

type FilterStatus = 'all' | 'quote' | 'pending' | 'paid' | 'overdue'
type SortColumn = 'client_name' | 'invoice_number' | 'client_type' | 'category' | 'total_incl_tax' | 'due_date' | 'status'

interface FacturesTabProps {
  filterStatus?: FilterStatus
  selectedYear?: number
  onCreateInvoice?: () => void
  onError?: (error: string | null) => void
  refreshTrigger?: number
}

export default function FacturesTab({
  filterStatus: externalFilterStatus,
  selectedYear,
  onCreateInvoice,
  onError,
  refreshTrigger,
}: FacturesTabProps) {
  const filterStatus = externalFilterStatus ?? 'all'
  const year = selectedYear ?? new Date().getFullYear()

  const invoiceFilters = useMemo(() => {
    const f: { status?: string; year?: number } = { year }
    if (filterStatus !== 'all') f.status = filterStatus
    return f
  }, [filterStatus, year])

  const queryClient = useQueryClient()
  const { invoices, isLoading: loading, error: invoicesError, refetch: refetchInvoices } = useInvoices(invoiceFilters)
  const [error, setError] = useState<string | null>(null)

  const invalidateInvoices = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    queryClient.invalidateQueries({ queryKey: ['financeKPIs'] })
  }
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false)
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<(Invoice & { invoice_lines: InvoiceLine[] }) | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<(Invoice & { invoice_lines: InvoiceLine[] }) | null>(null)
  const [invoiceToDelete, setInvoiceToDelete] = useState<(Invoice & { invoice_lines: InvoiceLine[] }) | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (invoicesError) {
      const msg = invoicesError?.message ?? 'Erreur lors du chargement des factures'
      setError(msg)
      onError?.(msg)
    } else {
      setError(null)
      onError?.(null)
    }
  }, [invoicesError])

  useEffect(() => {
    if (refreshTrigger) refetchInvoices()
  }, [refreshTrigger, refetchInvoices])

  const filteredInvoices = useMemo(() => invoices ?? [], [invoices])

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const sortedInvoices = useMemo(() => {
    if (!sortBy) return filteredInvoices
    const dir = sortDirection === 'asc' ? 1 : -1
    const getValue = (inv: Invoice & { invoice_lines: InvoiceLine[] }) => {
      switch (sortBy) {
        case 'client_name':
          return (inv.client_name || '').toLowerCase()
        case 'invoice_number':
          return (inv.invoice_number || '').toLowerCase()
        case 'client_type':
          return inv.client_type || ''
        case 'category':
          return (inv.category || '').toLowerCase()
        case 'total_incl_tax':
          return inv.total_incl_tax ?? 0
        case 'due_date':
          return inv.due_date ? new Date(inv.due_date).getTime() : 0
        case 'status':
          return inv.status || ''
        default:
          return ''
      }
    }
    return [...filteredInvoices].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (typeof va === 'number' && typeof vb === 'number') return dir * (va - vb)
      return dir * String(va).localeCompare(String(vb))
    })
  }, [filteredInvoices, sortBy, sortDirection])

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedInvoices.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedInvoices, currentPage])

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage)

  const handleView = (invoice: Invoice & { invoice_lines: InvoiceLine[] }) => {
    setViewingInvoice(invoice)
    setShowViewInvoiceModal(true)
  }

  const handleEdit = (invoice: Invoice & { invoice_lines: InvoiceLine[] }) => {
    setEditingInvoice(invoice)
    setShowEditInvoiceModal(true)
  }

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (confirm('Marquer cette facture comme payée ? Une transaction sera automatiquement créée.')) {
      try {
        await financeDataService.markInvoiceAsPaid(invoice.id!)
        invalidateInvoices()
      } catch (err) {
        console.error('Erreur:', err)
        alert('Erreur lors de la mise à jour')
      }
    }
  }

  const handleDeleteClick = (invoice: Invoice & { invoice_lines: InvoiceLine[] }) => {
    setInvoiceToDelete(invoice)
  }

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return
    try {
      setIsDeleting(true)
      await financeDataService.deleteInvoice(invoiceToDelete.id!)
      invalidateInvoices()
      setInvoiceToDelete(null)
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadPDF = async (invoice: Invoice & { invoice_lines: InvoiceLine[] }) => {
    try {
      await generateInvoicePDF(invoice)
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err)
      alert('Erreur lors de la génération du PDF')
    }
  }

  const invoiceCategories = useMemo(() => {
    const cats = new Set<string>()
    invoices.forEach((inv) => { if (inv.category) cats.add(inv.category) })
    return Array.from(cats).sort()
  }, [invoices])

  const updateClientType = async (inv: Invoice & { invoice_lines: InvoiceLine[] }, clientType: 'client' | 'supplier') => {
    try {
      await financeDataService.updateInvoice(inv.id, { invoice: { client_type: clientType } })
      invalidateInvoices()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const updateCategory = async (inv: Invoice & { invoice_lines: InvoiceLine[] }, category: string) => {
    try {
      await financeDataService.updateInvoice(inv.id, { invoice: { category: category || undefined } })
      invalidateInvoices()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const updateStatus = async (inv: Invoice & { invoice_lines: InvoiceLine[] }, status: string) => {
    try {
      await financeDataService.updateInvoice(inv.id, { invoice: { status: status as Invoice['status'] } })
      invalidateInvoices()
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des factures..." className="h-96" />
  }

  const allSelected = paginatedInvoices.length > 0 && selectedIds.size === paginatedInvoices.length

  return (
    <div className="space-y-6">
      {paginatedInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune facture"
          description="Créez votre première facture ou devis pour commencer."
          action={
            onCreateInvoice && (
              <Button variant="primary" size="sm" onClick={onCreateInvoice}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle facture
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
            addable={!!onCreateInvoice}
            onAddRow={onCreateInvoice ? () => onCreateInvoice() : undefined}
            selectAllChecked={allSelected}
            onSelectAllChange={(checked) =>
              setSelectedIds(checked ? new Set(paginatedInvoices.map((i) => i.id)) : new Set())
            }
          >
            <TableHeader>
              <TableRow hoverCellOnly>
                <TableHead minWidth={180} defaultWidth={220} sortable onSortClick={() => handleSort('client_name')}>
                  Client
                </TableHead>
                <TableHead minWidth={100} defaultWidth={120} sortable onSortClick={() => handleSort('invoice_number')}>
                  N° Facture
                </TableHead>
                <TableHead minWidth={100} defaultWidth={120} sortable onSortClick={() => handleSort('client_type')}>
                  Type client
                </TableHead>
                <TableHead minWidth={120} defaultWidth={140} sortable onSortClick={() => handleSort('category')}>
                  Catégorie
                </TableHead>
                <TableHead minWidth={100} defaultWidth={120} align="center" sortable onSortClick={() => handleSort('total_incl_tax')}>
                  Montant
                </TableHead>
                <TableHead minWidth={95} defaultWidth={110} sortable onSortClick={() => handleSort('due_date')}>
                  Échéance
                </TableHead>
                <TableHead minWidth={90} defaultWidth={120} align="center" sortable onSortClick={() => handleSort('status')}>
                  Statut
                </TableHead>
                <TableHead align="center" centerContent minWidth={48} defaultWidth={48} maxWidth={48}>
                  +
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  selected={selectedIds.has(inv.id)}
                  onSelectChange={(checked) =>
                    setSelectedIds((prev) => {
                      const next = new Set(prev)
                      if (checked) next.add(inv.id)
                      else next.delete(inv.id)
                      return next
                    })
                  }
                >
                  <TableCell
                    noHoverBorder
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 overflow-hidden"
                    onClick={() => handleView(inv)}
                  >
                    <div className="min-w-0 overflow-hidden">
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate block" title={inv.client_name}>
                        {inv.client_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2" onClick={() => handleView(inv)}>
                    <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">{inv.invoice_number}</span>
                  </TableCell>
                  <TableCell className="p-0">
                    <SelectPicker
                      variant="table"
                      size="xs"
                      value={inv.client_type || 'client'}
                      onChange={(v) => updateClientType(inv, v as 'client' | 'supplier')}
                      options={[
                        { value: 'client', label: 'Client' },
                        { value: 'supplier', label: 'Fournisseur' },
                      ]}
                      placeholder="Type client"
                      className="w-full h-8 min-h-8"
                    />
                  </TableCell>
                  <TableCell className="p-0">
                    <SelectPicker
                      variant="table"
                      size="xs"
                      value={inv.category || ''}
                      onChange={(v) => updateCategory(inv, v)}
                      options={[
                        { value: '', label: 'Catégorie' },
                        ...invoiceCategories.map((c) => ({ value: c, label: c })),
                      ]}
                      placeholder="Catégorie"
                      searchable
                      searchPlaceholder="Rechercher une catégorie..."
                      className="w-full h-8 min-h-8"
                    />
                  </TableCell>
                  <TableCell align="right" className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2" onClick={() => handleView(inv)}>
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                      {(inv.total_incl_tax || 0).toLocaleString('fr-FR')} €
                    </span>
                  </TableCell>
                  <TableCell className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2" onClick={() => handleView(inv)}>
                    {inv.due_date ? (
                      <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">
                        {new Date(inv.due_date).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </TableCell>
                  <TableCell align="center" className="p-0">
                    <SelectPicker
                      variant="table"
                      size="xs"
                      value={inv.status}
                      onChange={(v) => updateStatus(inv, v)}
                      options={[
                        { value: 'quote', label: 'Devis' },
                        { value: 'pending', label: 'En attente' },
                        { value: 'paid', label: 'Payée' },
                        { value: 'overdue', label: 'En retard' },
                        { value: 'cancelled', label: 'Annulée' },
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
                          onClick={() => handleEdit(inv)}
                          className="w-full justify-start"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(inv)}
                          className="w-full justify-start"
                        >
                          <Download className="w-3.5 h-3.5 mr-2" />
                          Télécharger PDF
                        </Button>
                        {inv.status !== 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(inv)}
                            className="w-full justify-start text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="w-3.5 h-3.5 mr-2" />
                            Marquer comme payée
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(inv)}
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
          totalItems={sortedInvoices.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={invoiceToDelete?.status === 'quote' ? 'Supprimer le devis' : 'Supprimer la facture'}
        description={
          invoiceToDelete?.status === 'quote'
            ? 'Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.'
            : 'Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.'
        }
        isLoading={isDeleting}
      />

      <EditInvoiceModal
        isOpen={showEditInvoiceModal}
        onClose={() => {
          setShowEditInvoiceModal(false)
          setEditingInvoice(null)
        }}
        onSuccess={() => {
          invalidateInvoices()
          setShowEditInvoiceModal(false)
          setEditingInvoice(null)
        }}
        invoice={editingInvoice}
      />

      <ViewInvoiceModal
        isOpen={showViewInvoiceModal}
        onClose={() => {
          setShowViewInvoiceModal(false)
          setViewingInvoice(null)
        }}
        invoice={viewingInvoice}
      />
    </div>
  )
}
