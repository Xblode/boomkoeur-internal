/**
 * Générateur de PDF pour factures et devis
 */

import jsPDF from 'jspdf'
import type { Invoice, InvoiceLine } from '@/types/finance'

export async function generateInvoicePDF(invoice: Invoice & { invoice_lines: InvoiceLine[] }) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 20
  let yPosition = margin

  // Fonction pour ajouter une nouvelle page si nécessaire
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > 277) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // En-tête
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('BOOMKŒUR.EXE', margin, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Association loi 1901', margin, yPosition)
  yPosition += 5
  pdf.text('N° SIRET: [À compléter]', margin, yPosition)
  yPosition += 10

  // Titre et numéro
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  const title = invoice.type === 'invoice' ? 'FACTURE' : 'DEVIS'
  pdf.text(title, pageWidth - margin, yPosition, { align: 'right' })
  yPosition += 5

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(invoice.invoice_number, pageWidth - margin, yPosition, { align: 'right' })
  yPosition += 5

  pdf.setFontSize(10)
  pdf.text(
    `Date d'émission: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )
  yPosition += 4

  if (invoice.due_date) {
    pdf.text(
      `Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`,
      pageWidth - margin,
      yPosition,
      { align: 'right' }
    )
    yPosition += 4
  }

  yPosition += 5

  // Client/Fournisseur
  checkPageBreak(20)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text(invoice.client_type === 'client' ? 'Facturer à' : 'Fournisseur', margin, yPosition)
  yPosition += 6

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(invoice.client_name, margin, yPosition)
  yPosition += 5

  if (invoice.client_address) {
    pdf.text(invoice.client_address, margin, yPosition)
    yPosition += 5
  }

  if (invoice.client_postal_code || invoice.client_city) {
    pdf.text(`${invoice.client_postal_code || ''} ${invoice.client_city || ''}`, margin, yPosition)
    yPosition += 5
  }

  if (invoice.client_email) {
    pdf.text(invoice.client_email, margin, yPosition)
    yPosition += 5
  }

  yPosition += 5

  // Table des lignes
  checkPageBreak(30)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Détail', margin, yPosition)
  yPosition += 6

  // En-tête du tableau
  pdf.setFillColor(40, 40, 40)
  pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 6, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)

  pdf.text('Description', margin + 2, yPosition)
  pdf.text('Qté', margin + 100, yPosition)
  pdf.text('Prix HT', margin + 120, yPosition)
  pdf.text('TVA', margin + 150, yPosition)
  pdf.text('Total TTC', margin + 170, yPosition)

  pdf.setTextColor(0, 0, 0)
  yPosition += 8

  // Lignes de facture
  invoice.invoice_lines?.forEach((line) => {
    checkPageBreak(8)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(line.description.substring(0, 40), margin + 2, yPosition)
    pdf.text(line.quantity.toString(), margin + 100, yPosition)
    pdf.text(
      `${line.unit_price_excl_tax.toFixed(2)} €`,
      margin + 120,
      yPosition
    )
    pdf.text(`${line.vat_rate}%`, margin + 150, yPosition)
    pdf.text(
      `${line.amount_incl_tax.toFixed(2)} €`,
      margin + 170,
      yPosition
    )
    yPosition += 6
  })

  yPosition += 5

  // Totaux
  checkPageBreak(20)
  const totalsX = pageWidth - margin - 60
  pdf.setFontSize(9)
  pdf.text('Sous-total HT:', totalsX, yPosition)
  pdf.text(
    `${invoice.subtotal_excl_tax.toFixed(2)} €`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )
  yPosition += 5

  pdf.text('TVA:', totalsX, yPosition)
  pdf.text(
    `${invoice.total_vat.toFixed(2)} €`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )
  yPosition += 6

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Total TTC:', totalsX, yPosition)
  pdf.text(
    `${invoice.total_incl_tax.toFixed(2)} €`,
    pageWidth - margin,
    yPosition,
    { align: 'right' }
  )
  yPosition += 10

  // Conditions de paiement et notes
  if (invoice.payment_terms || invoice.notes) {
    checkPageBreak(20)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    if (invoice.payment_terms) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Conditions de paiement:', margin, yPosition)
      yPosition += 5
      pdf.setFont('helvetica', 'normal')
      pdf.text(invoice.payment_terms, margin, yPosition)
      yPosition += 8
    }
    if (invoice.notes) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Notes:', margin, yPosition)
      yPosition += 5
      pdf.setFont('helvetica', 'normal')
      const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin)
      pdf.text(notesLines, margin, yPosition)
      yPosition += notesLines.length * 5
    }
  }

  // Télécharger le PDF
  const fileName = `${invoice.invoice_number}_${invoice.type === 'invoice' ? 'facture' : 'devis'}.pdf`
  pdf.save(fileName)
}
