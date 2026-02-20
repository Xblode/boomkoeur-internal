import type { BankAccount } from '@/types/finance'
import { getFromStorage, saveToStorage, generateId, updateInStorage, deleteFromStorage } from './storage'

const BANK_ACCOUNTS_KEY = 'finance_bank_accounts'

export function getBankAccounts(): BankAccount[] {
  return getFromStorage<BankAccount[]>(BANK_ACCOUNTS_KEY, [])
    .filter((account) => account.is_active)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getBankAccountById(id: string): BankAccount | null {
  const accounts = getFromStorage<BankAccount[]>(BANK_ACCOUNTS_KEY, [])
  return accounts.find((a) => a.id === id) || null
}

export function createBankAccount(data: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): BankAccount {
  const accounts = getFromStorage<BankAccount[]>(BANK_ACCOUNTS_KEY, [])
  
  const newAccount: BankAccount = {
    ...data,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  accounts.push(newAccount)
  saveToStorage(BANK_ACCOUNTS_KEY, accounts)
  
  return newAccount
}

export function updateBankAccount(id: string, updates: Partial<BankAccount>): BankAccount {
  return updateInStorage<BankAccount>(BANK_ACCOUNTS_KEY, id, updates)
}

export function deleteBankAccount(id: string): void {
  deleteFromStorage<BankAccount>(BANK_ACCOUNTS_KEY, id)
}
