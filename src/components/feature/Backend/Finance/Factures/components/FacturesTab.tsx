'use client'

import { useState, useEffect, useMemo } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Button } from '@/components/ui/atoms'
import { Edit2, Download, Check, Trash2, FileText, Plus } from 'lucide-react'
import type { Invoice, InvoiceLine } from '@/types/finance'
import EditInvoiceModal from '../modals/EditInvoiceModal'
import ViewInvoiceModal from '../modals/ViewInvoiceModal'
import { generateInvoicePDF } from '@/lib/utils/finance/pdf-generator'
import {
  LoadingState,
  DataTable,
  Column,
  StatusBadge,
  EmptyState
} from '../../shared/components'

type FilterStatus = 'all' | 'quote' | 'pending' | 'paid' | 'overdue'

interface FacturesTabProps {
  filterStatus?: FilterStatus
  selectedYear?: number
  onCreateInvoice?: () => void
  onError?: (error: string | null) => void
  refreshTrigger?: number
}

export default function FacturesTab({ filterStatus: externalFilterStatus, selectedYear, onCreateInvoice, onError, refreshTrigger }: FacturesTabProps) {
  const filterStatus = externalFilterStatus ?? 'all'
  const year = selectedYear ?? new Date().getFullYear()
  const [searchQuery, setSearchQuery] = useState('')
  const [invoices, setInvoices] = useState<(Invoice & { invoice_lines: InvoiceLine[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false)
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<(Invoice & { invoice_lines: InvoiceLine[] }) | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<(Invoice & { invoice_lines: InvoiceLine[] }) | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [filterStatus, year, refreshTrigger])

  async function loadInvoices() {
    try {
      setLoading(true)
      setError(null)
      onError?.(null)
      const filters: { status?: string; year?: number } = {}
      if (filterStatus !== 'all') {
        filters.status = filterStatus
      }
      filters.year = year
      const data = await financeDataService.getInvoices(filters)
      setInvoices(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const errorMsg = msg || 'Erreur lors du chargement des factures'
      setError(errorMsg)
      onError?.(errorMsg)
      console.error('Erreur lors du chargement des factures:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les factures
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          inv.invoice_number.toLowerCase().includes(query) ||
          inv.client_name.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [invoices, searchQuery])

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (confirm('Marquer cette facture comme payee ? Une transaction sera automatiquement creee.')) {
      try {
        await financeDataService.markInvoiceAsPaid(invoice.id!)
        await loadInvoices()
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la mise a jour')
      }
    }
  }

  const handleDelete = async (invoice: Invoice) => {
    if (confirm('Etes-vous sur de vouloir supprimer cette facture ?')) {
      try {
        await financeDataService.deleteInvoice(invoice.id!)
        await loadInvoices()
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleDownloadPDF = async (invoice: Invoice & { invoice_lines: InvoiceLine[] }) => {
    try {
      await generateInvoicePDF(invoice)
    } catch (error) {
      console.error('Erreur lors de la generation du PDF:', error)
      alert('Erreur lors de la generation du PDF')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'quote': return 'default'
      case 'overdue': return 'danger'
      default: return 'warning'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payee'
      case 'quote': return 'Devis'
      case 'overdue': return 'En retard'
      default: return 'En attente'
    }
  }

  const getTypeLabel = (type: string) => {
    return type === 'invoice' ? 'Facture' : 'Devis'
  }

  const getTypeVariant = (type: string) => {
    return type === 'invoice' ? 'success' : 'info'
  }

  const getClientTypeLabel = (clientType?: string) => {
    if (!clientType) return 'Client'
    return clientType === 'client' ? 'Client' : 'Fournisseur'
  }

  const getClientTypeVariant = (clientType?: string) => {
    return clientType === 'supplier' ? 'warning' : 'info'
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

  const tableColumns: Column<Invoice & { invoice_lines: InvoiceLine[] }>[] = [
    {
      key: 'invoice_number',
      label: 'No Facture',
      sortable: true,
      width: 'w-auto',
      render: (invoice) => (
        <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">{invoice.invoice_number}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: 'w-auto',
      render: (invoice) => (
        <StatusBadge
          label={getTypeLabel(invoice.type)}
          variant={getTypeVariant(invoice.type)}
          className="px-2 py-0.5 text-[10px] uppercase tracking-wide"
          showIcon={false}
        />
      ),
    },
    {
      key: 'client_name',
      label: 'Client',
      sortable: true,
      width: 'w-full',
      render: (invoice) => (
        <div className="flex items-center justify-between gap-2 h-full group/row">
          <div className="truncate min-w-0">
            <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{invoice.client_name}</div>
          </div>
          {hoveredRow === invoice.id && (
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingInvoice(invoice)
                  setShowEditInvoiceModal(true)
                }}
                className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                title="Modifier"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadPDF(invoice)}
                className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                title="Telecharger PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              {invoice.status !== 'paid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsPaid(invoice)}
                  className="h-6 w-6 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 text-zinc-400 hover:text-green-500"
                  title="Marquer comme payee"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(invoice)}
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
      key: 'client_type',
      label: 'Type Client',
      sortable: true,
      width: 'w-auto',
      render: (invoice) => (
        <StatusBadge
          label={getClientTypeLabel(invoice.client_type)}
          variant={getClientTypeVariant(invoice.client_type)}
          className="px-2 py-0.5 text-[10px]"
          showIcon={false}
        />
      ),
    },
    {
      key: 'category',
      label: 'Categorie',
      sortable: true,
      width: 'w-auto',
      render: (invoice) => (
        invoice.category ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium whitespace-nowrap transition-colors ${getCategoryStyle(invoice.category)}`}>
            {invoice.category}
          </span>
        ) : (
          <span className="text-xs text-zinc-400 whitespace-nowrap">-</span>
        )
      ),
    },
    {
      key: 'total_incl_tax',
      label: 'Montant TTC',
      sortable: true,
      width: 'w-auto',
      align: 'right',
      render: (invoice) => (
        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm whitespace-nowrap">
          {(invoice.total_incl_tax || 0).toLocaleString('fr-FR')} EUR
        </span>
      ),
    },
    {
      key: 'due_date',
      label: 'Echeance',
      sortable: true,
      width: 'w-auto',
      render: (invoice) => (
        invoice.due_date ? (
          <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">
            {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
          </span>
        ) : (
          <span className="text-xs text-zinc-500 whitespace-nowrap">-</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      width: 'w-auto',
      align: 'right',
      render: (invoice) => (
        <StatusBadge
          label={getStatusLabel(invoice.status)}
          variant={getStatusVariant(invoice.status)}
          className="px-2 py-0.5 text-[10px]"
          showIcon={true}
        />
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Chargement des factures..." className="h-96" />
  }

  return (
    <div className="space-y-6">
      {/* Vue Liste */}
      <DataTable
        data={filteredInvoices}
        columns={tableColumns}
        onRowClick={(invoice) => {
          setViewingInvoice(invoice)
          setShowViewInvoiceModal(true)
        }}
        onRowHover={setHoveredRow}
        emptyMessage="Aucune facture a afficher"
        emptyState={
          <EmptyState
            icon={FileText}
            title="Aucune facture"
            description="Creez votre premiere facture ou devis pour commencer."
            action={
              onCreateInvoice && (
                <Button variant="primary" size="sm" onClick={onCreateInvoice}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle facture
                </Button>
              )
            }
          />
        }
      />

      {/* Modals */}
      <EditInvoiceModal
        isOpen={showEditInvoiceModal}
        onClose={() => {
          setShowEditInvoiceModal(false)
          setEditingInvoice(null)
        }}
        onSuccess={loadInvoices}
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
