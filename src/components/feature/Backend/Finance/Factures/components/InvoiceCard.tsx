import { Card, CardContent } from '@/components/ui/molecules'
import { Button } from '@/components/ui/atoms'
import { Eye, Download, Edit, Check, Trash2 } from 'lucide-react'
import { StatusBadge } from '../../shared/components'
import type { Invoice } from '@/types/finance'

interface InvoiceCardProps {
  invoice: Invoice & { invoice_lines?: any[] }
  onView?: (invoice: Invoice) => void
  onEdit?: (invoice: Invoice) => void
  onDownload?: (invoice: Invoice) => void
  onMarkPaid?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
  className?: string
}

export default function InvoiceCard({
  invoice,
  onView,
  onEdit,
  onDownload,
  onMarkPaid,
  onDelete,
  className = '',
}: InvoiceCardProps) {
  const getStatusVariant = () => {
    switch (invoice.status) {
      case 'paid':
        return 'success'
      case 'quote':
        return 'default'
      case 'overdue':
        return 'danger'
      default:
        return 'warning'
    }
  }

  const getStatusLabel = () => {
    switch (invoice.status) {
      case 'paid':
        return 'Payee'
      case 'quote':
        return 'Devis'
      case 'overdue':
        return 'En retard'
      default:
        return 'En attente'
    }
  }

  return (
    <Card className={`hover:border-accent/50 transition-all ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-heading font-bold text-lg">{invoice.invoice_number}</p>
            <p className="text-sm text-zinc-500">{invoice.client_name}</p>
          </div>
          <StatusBadge label={getStatusLabel()} variant={getStatusVariant()} />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Montant TTC</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
              {(invoice.total_incl_tax || 0).toLocaleString('fr-FR')} EUR
            </span>
          </div>
          {invoice.due_date && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Echeance</span>
              <span className="font-mono">
                {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {onView && (
            <Button variant="secondary" size="sm" onClick={() => onView(invoice)}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onEdit && invoice.status !== 'paid' && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(invoice)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDownload && (
            <Button variant="secondary" size="sm" onClick={() => onDownload(invoice)}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onMarkPaid && invoice.status === 'pending' && (
            <Button variant="secondary" size="sm" onClick={() => onMarkPaid(invoice)}>
              <Check className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(invoice)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

