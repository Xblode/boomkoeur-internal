/**
 * Fonctions d'export pour les transactions
 */

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '@/types/finance'

/**
 * Export Excel - Journal Comptable
 */
export function exportJournalExcel(transactions: Transaction[], year: number) {
  // Préparer les données pour le journal
  const journalData = transactions.map((t) => ({
    'N° Écriture': t.entry_number || '-',
    Date: new Date(t.date).toLocaleDateString('fr-FR'),
    'N° Pièce': t.piece_number || '-',
    Libellé: t.label,
    Compte: t.bank_account_id || '-',
    Catégorie: t.category,
    Type: t.type === 'income' ? 'Entrée' : 'Sortie',
    Débit: t.debit || 0,
    Crédit: t.credit || 0,
    'Montant TTC': t.amount,
    'Montant HT': t.amount_excl_tax || t.amount,
    'Taux TVA': t.vat_rate ? `${t.vat_rate}%` : '-',
    'Méthode de paiement': t.payment_method || '-',
    Statut: t.status === 'validated' ? 'Validé' : t.status === 'reconciled' ? 'Rapproché' : 'En attente',
    'Date validation': t.validated_at ? new Date(t.validated_at).toLocaleDateString('fr-FR') : '-',
    Notes: t.notes || '-',
  }))

  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new()

  // Feuille 1 : Journal complet
  const ws1 = XLSX.utils.json_to_sheet(journalData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Journal Comptable')

  // Feuille 2 : Balance par catégorie
  const categoryBalance: Record<string, { debit: number; credit: number; balance: number }> = {}
  transactions.forEach((t) => {
    if (!categoryBalance[t.category]) {
      categoryBalance[t.category] = { debit: 0, credit: 0, balance: 0 }
    }
    categoryBalance[t.category].debit += t.debit || 0
    categoryBalance[t.category].credit += t.credit || 0
    categoryBalance[t.category].balance += (t.debit || 0) - (t.credit || 0)
  })

  const balanceData = Object.entries(categoryBalance).map(([category, totals]) => ({
    Catégorie: category,
    'Total Débit': totals.debit,
    'Total Crédit': totals.credit,
    Solde: totals.balance,
  }))

  const ws2 = XLSX.utils.json_to_sheet(balanceData)
  XLSX.utils.book_append_sheet(wb, ws2, 'Balance par Catégorie')

  // Feuille 3 : Grand Livre (groupé par compte)
  const accountData: Record<string, Transaction[]> = {}
  transactions.forEach((t) => {
    const account = t.bank_account_id || 'Autre'
    if (!accountData[account]) {
      accountData[account] = []
    }
    accountData[account].push(t)
  })

  const grandLivreData: any[] = []
  Object.entries(accountData).forEach(([account, accountTransactions]) => {
    grandLivreData.push({ Compte: account, Date: '', Libellé: 'SOLDE INITIAL', Débit: '', Crédit: '', Solde: '' })
    let solde = 0
    accountTransactions.forEach((t) => {
      solde += (t.debit || 0) - (t.credit || 0)
      grandLivreData.push({
        Compte: '',
        Date: new Date(t.date).toLocaleDateString('fr-FR'),
        Libellé: t.label,
        Débit: t.debit || 0,
        Crédit: t.credit || 0,
        Solde: solde,
      })
    })
    grandLivreData.push({ Compte: '', Date: '', Libellé: 'SOLDE FINAL', Débit: '', Crédit: '', Solde: solde })
    grandLivreData.push({ Compte: '', Date: '', Libellé: '', Débit: '', Crédit: '', Solde: '' })
  })

  const ws3 = XLSX.utils.json_to_sheet(grandLivreData)
  XLSX.utils.book_append_sheet(wb, ws3, 'Grand Livre')

  // Générer le fichier
  const fileName = `Journal_Comptable_${year}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export Excel - Transactions simples
 */
export function exportTransactionsExcel(transactions: Transaction[], year: number) {
  const data = transactions.map((t) => ({
    Date: new Date(t.date).toLocaleDateString('fr-FR'),
    Libellé: t.label,
    Catégorie: t.category,
    Type: t.type === 'income' ? 'Entrée' : 'Sortie',
    Montant: t.amount,
    Statut: t.status === 'validated' ? 'Validé' : t.status === 'reconciled' ? 'Rapproché' : 'En attente',
    Notes: t.notes || '-',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

  const fileName = `Transactions_${year}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export FEC (Fichier des Écritures Comptables)
 */
export function exportFEC(transactions: Transaction[], year: number) {
  // Format FEC selon norme DGFiP
  const fecLines: string[] = []

  // En-tête avec les colonnes obligatoires
  const header = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcritureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise',
  ].join('|')

  fecLines.push(header)

  // Lignes de données
  transactions.forEach((t) => {
    const journalCode = t.type === 'income' ? 'VE' : 'AC' // VE = Ventes, AC = Achats
    const journalLib = t.type === 'income' ? 'Ventes' : 'Achats'
    const ecritureNum = t.entry_number || ''
    const ecritureDate = new Date(t.date).toISOString().split('T')[0].replace(/-/g, '')
    const compteNum = t.bank_account_id?.substring(0, 8) || '51200000' // Compte bancaire par défaut
    const compteLib = t.category || 'Divers'
    const pieceRef = t.piece_number || ''
    const pieceDate = ecritureDate
    const ecritureLib = t.label
    const debit = (t.debit || 0).toFixed(2).replace('.', ',')
    const credit = (t.credit || 0).toFixed(2).replace('.', ',')
    const validDate = t.validated_at
      ? new Date(t.validated_at).toISOString().split('T')[0].replace(/-/g, '')
      : ''

    const line = [
      journalCode,
      journalLib,
      ecritureNum,
      ecritureDate,
      compteNum,
      compteLib,
      '', // CompAuxNum
      '', // CompAuxLib
      pieceRef,
      pieceDate,
      ecritureLib,
      debit,
      credit,
      '', // EcritureLet
      '', // DateLet
      validDate,
      '', // Montantdevise
      '', // Idevise
    ].join('|')

    fecLines.push(line)
  })

  // Créer le fichier texte
  const content = fecLines.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `FEC_${year}_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export PDF - Journal Comptable
 */
export function exportJournalPDF(transactions: Transaction[], year: number) {
  try {
    if (!transactions || transactions.length === 0) {
      alert('Aucune transaction à exporter')
      return
    }

    const pdf = new jsPDF('l', 'mm', 'a4') // Paysage
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15

    // En-tête
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BOOMKŒUR.EXE', margin, 15)
    pdf.setFontSize(14)
    pdf.text(`Journal Comptable ${year}`, margin, 22)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Date d'édition: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, 22, {
      align: 'right',
    })

    // Préparer les données pour le tableau
    const tableData = transactions.map((t) => [
      t.entry_number || '-',
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.piece_number || '-',
      (t.label || '').substring(0, 30), // Limiter la longueur
      (t.category || '').substring(0, 15),
      t.debit ? t.debit.toFixed(2) : '0.00',
      t.credit ? t.credit.toFixed(2) : '0.00',
      t.status === 'validated' ? 'Validé' : t.status === 'reconciled' ? 'Rapproché' : 'En attente',
    ])

    // Créer le tableau
    autoTable(pdf, {
      head: [['N°', 'Date', 'Pièce', 'Libellé', 'Catégorie', 'Débit', 'Crédit', 'Statut']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, textColor: [0, 0, 0] },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: margin, right: margin },
    })

    // Totaux
    const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0)
    const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0)
    const balance = totalDebit - totalCredit

    // Récupérer la position Y finale après le tableau
    const finalY = (pdf as any).lastAutoTable?.finalY || 200
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total Débit: ${totalDebit.toFixed(2)} €`, margin, finalY + 10)
    pdf.text(`Total Crédit: ${totalCredit.toFixed(2)} €`, margin, finalY + 16)
    pdf.text(`Solde: ${balance.toFixed(2)} €`, margin, finalY + 22)

    // Zone de signature
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Signature et cachet:', margin, finalY + 35)
    pdf.rect(margin, finalY + 38, 80, 20)

    // Télécharger
    const fileName = `Journal_Comptable_${year}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error)
    alert(`Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Export PDF - Bilan
 */
export function exportBilanPDF(profitLoss: any, balanceSheet: any, ratios: any, period: string) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    let yPosition = 20

  // En-tête
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('BOOMKŒUR.EXE', margin, yPosition)
  yPosition += 8
  pdf.setFontSize(16)
  pdf.text(`Bilan Financier - ${period}`, margin, yPosition)
  yPosition += 8
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Date d'édition: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Compte de résultat
  if (profitLoss) {
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Compte de Résultat', margin, yPosition)
    yPosition += 8

    const plData: any[] = []
    if (profitLoss.revenue) {
      Object.entries(profitLoss.revenue).forEach(([key, value]: [string, any]) => {
        plData.push([key, value.toFixed(2) + ' €'])
      })
    }
    if (profitLoss.expenses) {
      Object.entries(profitLoss.expenses).forEach(([key, value]: [string, any]) => {
        plData.push([key, '-' + value.toFixed(2) + ' €'])
      })
    }
    if (profitLoss.netResult !== undefined) {
      plData.push(['Résultat Net', profitLoss.netResult.toFixed(2) + ' €'])
    }

    autoTable(pdf, {
      head: [['Poste', 'Montant']],
      body: plData,
      startY: yPosition,
      styles: { fontSize: 9, textColor: [0, 0, 0] },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      margin: { left: margin, right: margin },
    })
    yPosition = (pdf as any).lastAutoTable?.finalY ? (pdf as any).lastAutoTable.finalY + 15 : yPosition + 50
  }

  // Bilan patrimonial
  if (balanceSheet && yPosition > 250) {
    pdf.addPage()
    yPosition = 20
  }

  if (balanceSheet) {
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Bilan Patrimonial', margin, yPosition)
    yPosition += 8

    const bsData: any[] = []
    if (balanceSheet.assets) {
      bsData.push(['ACTIF', ''])
      Object.entries(balanceSheet.assets).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.total !== undefined) {
          bsData.push([key, value.total.toFixed(2) + ' €'])
        } else if (typeof value === 'number') {
          bsData.push([key, value.toFixed(2) + ' €'])
        }
      })
    }
    if (balanceSheet.liabilities) {
      bsData.push(['PASSIF', ''])
      Object.entries(balanceSheet.liabilities).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.total !== undefined) {
          bsData.push([key, value.total.toFixed(2) + ' €'])
        } else if (typeof value === 'number') {
          bsData.push([key, value.toFixed(2) + ' €'])
        }
      })
    }

    autoTable(pdf, {
      head: [['Poste', 'Montant']],
      body: bsData,
      startY: yPosition,
      styles: { fontSize: 9, textColor: [0, 0, 0] },
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      margin: { left: margin, right: margin },
    })
  }

  // Télécharger
  const fileName = `Bilan_${period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
  } catch (error) {
    console.error('Erreur lors de l\'export PDF du bilan:', error)
    alert(`Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Export Excel - Bilan
 */
export function exportBilanExcel(profitLoss: any, balanceSheet: any, ratios: any, period: string) {
  const wb = XLSX.utils.book_new()

  // Feuille 1 : Compte de résultat
  if (profitLoss) {
    const plData: any[] = []
    if (profitLoss.revenue) {
      Object.entries(profitLoss.revenue).forEach(([key, value]) => {
        plData.push({ Poste: key, Montant: value })
      })
    }
    if (profitLoss.expenses) {
      Object.entries(profitLoss.expenses).forEach(([key, value]) => {
        plData.push({ Poste: key, Montant: -(value as number) })
      })
    }
    if (profitLoss.netResult !== undefined) {
      plData.push({ Poste: 'Résultat Net', Montant: profitLoss.netResult })
    }

    const ws1 = XLSX.utils.json_to_sheet(plData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Compte de Résultat')
  }

  // Feuille 2 : Bilan patrimonial
  if (balanceSheet) {
    const bsData: any[] = []
    if (balanceSheet.assets) {
      Object.entries(balanceSheet.assets).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.total !== undefined) {
          bsData.push({ Poste: key, Montant: value.total })
        } else if (typeof value === 'number') {
          bsData.push({ Poste: key, Montant: value })
        }
      })
    }
    if (balanceSheet.liabilities) {
      Object.entries(balanceSheet.liabilities).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value.total !== undefined) {
          bsData.push({ Poste: key, Montant: value.total })
        } else if (typeof value === 'number') {
          bsData.push({ Poste: key, Montant: value })
        }
      })
    }

    const ws2 = XLSX.utils.json_to_sheet(bsData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Bilan Patrimonial')
  }

  // Feuille 3 : Ratios
  if (ratios) {
    const ratiosData = Object.entries(ratios).map(([key, value]) => ({
      Ratio: key,
      Valeur: typeof value === 'number' ? value.toFixed(2) : value,
    }))
    const ws3 = XLSX.utils.json_to_sheet(ratiosData)
    XLSX.utils.book_append_sheet(wb, ws3, 'Ratios Financiers')
  }

  const fileName = `Bilan_${period.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}
