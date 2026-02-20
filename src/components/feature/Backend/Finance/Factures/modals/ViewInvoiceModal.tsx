'use client'

import { Modal } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'
import { Download, X } from 'lucide-react'
import type { Invoice, InvoiceLine } from '@/types/finance'
import { generateInvoicePDF } from '@/lib/utils/finance/pdf-generator'

interface ViewInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: (Invoice & { invoice_lines: InvoiceLine[] }) | null
}

export default function ViewInvoiceModal({ isOpen, onClose, invoice }: ViewInvoiceModalProps) {
  if (!invoice) return null

  const handleDownloadPDF = async () => {
    if (!invoice) return
    try {
      await generateInvoicePDF(invoice)
    } catch (error) {
      console.error('Erreur lors de la generation du PDF:', error)
      alert('Erreur lors de la generation du PDF')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${invoice.type === 'invoice' ? 'Facture' : 'Devis'} ${invoice.invoice_number}`}
      size="lg"
      scrollable
    >
      <div className="space-y-6">
        {/* En-tete */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-border-custom">
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase mb-2">BOOMKŒUR.EXE</h2>
            <p className="text-sm text-zinc-500">Association loi 1901</p>
            <p className="text-sm text-zinc-500">N° SIRET: [A completer]</p>
          </div>
          <div className="text-right">
            <div className="font-heading text-lg font-bold uppercase mb-1">
              {invoice.type === 'invoice' ? 'FACTURE' : 'DEVIS'}
            </div>
            <div className="font-mono text-sm text-zinc-900 dark:text-zinc-50">{invoice.invoice_number}</div>
            <div className="text-xs text-zinc-500 mt-2">
              Date d'emission: {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
            </div>
            {invoice.due_date && (
              <div className="text-xs text-zinc-500">
                Echeance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>

        {/* Client/Fournisseur */}
        <div>
          <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
            {invoice.client_type === 'client' ? 'Facturer a' : 'Fournisseur'}
          </h3>
          <div className="p-4 bg-background-tertiary border-2 border-border-custom rounded">
            <p className="font-bold text-foreground">{invoice.client_name}</p>
            {invoice.client_address && <p className="text-sm text-zinc-600 dark:text-zinc-400">{invoice.client_address}</p>}
            {(invoice.client_postal_code || invoice.client_city) && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {invoice.client_postal_code} {invoice.client_city}
              </p>
            )}
            {invoice.client_email && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{invoice.client_email}</p>
            )}
          </div>
        </div>

        {/* Lignes de facture */}
        <div>
          <h3 className="font-heading text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
            Detail
          </h3>
          <div className="border-2 border-border-custom rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-background-tertiary">
                <tr>
                  <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider text-zinc-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center font-heading text-xs uppercase tracking-wider text-zinc-500">
                    Qte
                  </th>
                  <th className="px-4 py-3 text-right font-heading text-xs uppercase tracking-wider text-zinc-500">
                    Prix unitaire HT
                  </th>
                  <th className="px-4 py-3 text-right font-heading text-xs uppercase tracking-wider text-zinc-500">
                    TVA
                  </th>
                  <th className="px-4 py-3 text-right font-heading text-xs uppercase tracking-wider text-zinc-500">
                    Total TTC
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_lines?.map((line, index) => (
                  <tr
                    key={line.id}
                    className={index % 2 === 0 ? 'bg-background-secondary/30' : ''}
                  >
                    <td className="px-4 py-3 text-sm">{line.description}</td>
                    <td className="px-4 py-3 text-center text-sm">{line.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono">
                      {line.unit_price_excl_tax.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      EUR
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono">
                      {line.vat_rate}%
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono font-bold">
                      {line.amount_incl_tax.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      EUR
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Sous-total HT:</span>
              <span className="font-mono font-bold">
                {invoice.subtotal_excl_tax.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                EUR
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">TVA:</span>
              <span className="font-mono font-bold">
                {invoice.total_vat.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                EUR
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-border-custom text-lg font-bold">
              <span>Total TTC:</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-50">
                {invoice.total_incl_tax.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                EUR
              </span>
            </div>
          </div>
        </div>

        {/* Conditions de paiement et notes */}
        {(invoice.payment_terms || invoice.notes) && (
          <div className="pt-4 border-t border-border-custom space-y-2">
            {invoice.payment_terms && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                  Conditions de paiement
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{invoice.payment_terms}</p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Statut */}
        <div className="pt-4 border-t border-border-custom">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Statut</p>
              <span
                className={`inline-block px-3 py-1 text-xs font-heading uppercase rounded border ${
                  invoice.status === 'paid'
                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                    : invoice.status === 'overdue'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : invoice.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                }`}
              >
                {invoice.status === 'paid'
                  ? '✅ Payee'
                  : invoice.status === 'overdue'
                  ? '⚠️ En retard'
                  : invoice.status === 'pending'
                  ? '⏳ En attente'
                  : '📝 Devis'}
              </span>
            </div>
            {invoice.paid_date && (
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Date de paiement</p>
                <p className="text-sm font-mono">
                  {new Date(invoice.paid_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-custom mt-6">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
        <Button variant="primary" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Telecharger PDF
        </Button>
      </div>
    </Modal>
  )
}

