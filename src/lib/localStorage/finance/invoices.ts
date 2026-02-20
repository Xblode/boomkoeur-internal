import type { Invoice, InvoiceLine } from '@/types/finance'
import { getFromStorage, saveToStorage, generateId, generateInvoiceNumber, updateInStorage, deleteFromStorage } from './storage'

const INVOICES_KEY = 'finance_invoices'
const INVOICE_LINES_KEY = 'finance_invoice_lines'

export function getInvoices(filters?: { type?: string; status?: string }): (Invoice & { invoice_lines: InvoiceLine[] })[] {
  let invoices = getFromStorage<Invoice[]>(INVOICES_KEY, [])
  
  if (filters?.type && filters.type !== 'all') {
    invoices = invoices.filter((i) => i.type === filters.type)
  }
  
  if (filters?.status && filters.status !== 'all') {
    invoices = invoices.filter((i) => i.status === filters.status)
  }
  
  // Attach lines
  const lines = getFromStorage<InvoiceLine[]>(INVOICE_LINES_KEY, [])
  return invoices.map((invoice) => ({
    ...invoice,
    invoice_lines: lines.filter((l) => l.invoice_id === invoice.id).sort((a, b) => a.order_index - b.order_index),
  })).sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
}

export function getInvoiceById(id: string): (Invoice & { invoice_lines: InvoiceLine[] }) | null {
  const invoices = getFromStorage<Invoice[]>(INVOICES_KEY, [])
  const invoice = invoices.find((i) => i.id === id)
  
  if (!invoice) return null
  
  const lines = getFromStorage<InvoiceLine[]>(INVOICE_LINES_KEY, [])
  return {
    ...invoice,
    invoice_lines: lines.filter((l) => l.invoice_id === id).sort((a, b) => a.order_index - b.order_index),
  }
}

export function createInvoice(data: {
  invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>
  lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[]
}): Invoice & { invoice_lines: InvoiceLine[] } {
  const invoices = getFromStorage<Invoice[]>(INVOICES_KEY, [])
  const invoiceLines = getFromStorage<InvoiceLine[]>(INVOICE_LINES_KEY, [])
  
  // Générer l'ID d'abord, puis utiliser cet ID pour générer le numéro de facture
  const newId = generateId()
  const invoice_number = generateInvoiceNumber(newId, data.invoice.type)
  
  const newInvoice: Invoice = {
    ...data.invoice,
    id: newId,
    invoice_number,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  const newLines: InvoiceLine[] = data.lines.map((line, index) => ({
    ...line,
    id: generateId(),
    invoice_id: newInvoice.id,
    order_index: index,
    created_at: new Date().toISOString(),
  }))
  
  invoices.push(newInvoice)
  invoiceLines.push(...newLines)
  
  saveToStorage(INVOICES_KEY, invoices)
  saveToStorage(INVOICE_LINES_KEY, invoiceLines)
  
  return { ...newInvoice, invoice_lines: newLines }
}

export function updateInvoice(
  id: string,
  updates: {
    invoice?: Partial<Invoice>
    lines?: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[]
  }
): Invoice & { invoice_lines: InvoiceLine[] } {
  const invoices = getFromStorage<Invoice[]>(INVOICES_KEY, [])
  const invoiceLines = getFromStorage<InvoiceLine[]>(INVOICE_LINES_KEY, [])
  
  // Update invoice
  const invoiceIndex = invoices.findIndex((i) => i.id === id)
  if (invoiceIndex === -1) {
    throw new Error(`Invoice with id "${id}" not found`)
  }
  
  if (updates.invoice) {
    invoices[invoiceIndex] = {
      ...invoices[invoiceIndex],
      ...updates.invoice,
      updated_at: new Date().toISOString(),
    }
  }
  
  // Update lines if provided
  if (updates.lines) {
    // Remove old lines
    const filteredLines = invoiceLines.filter((l) => l.invoice_id !== id)
    
    // Add new lines
    const newLines = updates.lines.map((line, index) => ({
      ...line,
      id: generateId(),
      invoice_id: id,
      order_index: index,
      created_at: new Date().toISOString(),
    }))
    
    saveToStorage(INVOICE_LINES_KEY, [...filteredLines, ...newLines])
  }
  
  saveToStorage(INVOICES_KEY, invoices)
  
  return getInvoiceById(id)!
}

export function deleteInvoice(id: string): void {
  // Delete invoice
  deleteFromStorage<Invoice>(INVOICES_KEY, id)
  
  // Delete lines
  const invoiceLines = getFromStorage<InvoiceLine[]>(INVOICE_LINES_KEY, [])
  const filteredLines = invoiceLines.filter((l) => l.invoice_id !== id)
  saveToStorage(INVOICE_LINES_KEY, filteredLines)
}

export function markInvoiceAsPaid(id: string, paidDate?: string): Invoice & { invoice_lines: InvoiceLine[] } {
  return updateInvoice(id, {
    invoice: {
      status: 'paid',
      paid_date: paidDate || new Date().toISOString(),
    },
  })
}
