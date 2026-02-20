import type { Transaction, TransactionCategory } from '@/types/finance'
import { getFromStorage, saveToStorage, generateId, generateEntryNumber, updateInStorage, deleteFromStorage } from './storage'

const TRANSACTIONS_KEY = 'finance_transactions'
const CATEGORIES_KEY = 'finance_transaction_categories'

// Transactions CRUD
export function getTransactions(year?: number): Transaction[] {
  const allTransactions = getFromStorage<Transaction[]>(TRANSACTIONS_KEY, [])
  if (year) {
    return allTransactions.filter((t) => t.fiscal_year === year)
  }
  return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getTransactionById(id: string): Transaction | null {
  const transactions = getFromStorage<Transaction[]>(TRANSACTIONS_KEY, [])
  return transactions.find((t) => t.id === id) || null
}

export function createTransaction(data: Omit<Transaction, 'id' | 'entry_number' | 'created_at' | 'updated_at'>): Transaction {
  const transactions = getFromStorage<Transaction[]>(TRANSACTIONS_KEY, [])
  const fiscal_year = data.fiscal_year || new Date(data.date).getFullYear()
  
  // Générer l'ID d'abord, puis utiliser cet ID pour générer le numéro d'écriture
  const newId = generateId()
  const entry_number = generateEntryNumber(newId)
  
  const newTransaction: Transaction = {
    ...data,
    id: newId,
    entry_number,
    fiscal_year,
    debit: data.type === 'expense' ? data.amount : 0,
    credit: data.type === 'income' ? data.amount : 0,
    reconciled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  transactions.push(newTransaction)
  saveToStorage(TRANSACTIONS_KEY, transactions)
  
  return newTransaction
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction {
  return updateInStorage<Transaction>(TRANSACTIONS_KEY, id, updates)
}

export function deleteTransaction(id: string): void {
  deleteFromStorage<Transaction>(TRANSACTIONS_KEY, id)
}

export function validateTransaction(id: string, userId: string): Transaction {
  return updateInStorage<Transaction>(TRANSACTIONS_KEY, id, {
    status: 'validated',
    validated_at: new Date().toISOString(),
    validated_by: userId,
  })
}

export function reconcileTransaction(id: string): Transaction {
  return updateInStorage<Transaction>(TRANSACTIONS_KEY, id, {
    status: 'reconciled',
    reconciled: true,
    reconciliation_date: new Date().toISOString(),
  })
}

// Transaction Categories CRUD
export function getTransactionCategories(type?: 'income' | 'expense'): TransactionCategory[] {
  const categories = getFromStorage<TransactionCategory[]>(CATEGORIES_KEY, getDefaultCategories())
  if (type) {
    return categories.filter((c) => c.type === type && c.is_active)
  }
  return categories.filter((c) => c.is_active)
}

export function createTransactionCategory(data: Omit<TransactionCategory, 'id' | 'created_at' | 'updated_at'>): TransactionCategory {
  const categories = getFromStorage<TransactionCategory[]>(CATEGORIES_KEY, [])
  
  const newCategory: TransactionCategory = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  categories.push(newCategory)
  saveToStorage(CATEGORIES_KEY, categories)
  
  return newCategory
}

export function updateTransactionCategory(id: string, updates: Partial<TransactionCategory>): TransactionCategory {
  return updateInStorage<TransactionCategory>(CATEGORIES_KEY, id, updates)
}

export function deleteTransactionCategory(id: string): TransactionCategory {
  return updateInStorage<TransactionCategory>(CATEGORIES_KEY, id, { is_active: false })
}

// Helper: Default categories
function getDefaultCategories(): TransactionCategory[] {
  return [
    {
      id: 'cat-billetterie',
      name: 'Billetterie',
      type: 'income',
      is_default: true,
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-bar',
      name: 'Bar',
      type: 'income',
      is_default: true,
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-merchandising',
      name: 'Merchandising',
      type: 'income',
      is_default: true,
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-subventions',
      name: 'Subventions',
      type: 'income',
      is_default: true,
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-cachets',
      name: 'Cachets artistes',
      type: 'expense',
      is_default: true,
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-location',
      name: 'Location',
      type: 'expense',
      is_default: true,
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-technique',
      name: 'Technique',
      type: 'expense',
      is_default: true,
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'cat-communication',
      name: 'Communication',
      type: 'expense',
      is_default: true,
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}
