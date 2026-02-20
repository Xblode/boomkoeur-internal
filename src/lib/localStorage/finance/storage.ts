// Helper functions for localStorage operations
import { safePadStart } from '@/lib/utils/safePadStart'

console.log('🔄 [storage.ts] Module chargé')

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  
  try {
    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error)
  }
}

export function updateInStorage<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T {
  const items = getFromStorage<T[]>(key, [])
  const index = items.findIndex((item) => item.id === id)
  
  if (index === -1) {
    throw new Error(`Item with id "${id}" not found in "${key}"`)
  }
  
  const updatedItem = {
    ...items[index],
    ...updates,
    updated_at: new Date().toISOString(),
  }
  
  items[index] = updatedItem
  saveToStorage(key, items)
  
  return updatedItem
}

export function deleteFromStorage<T extends { id: string }>(
  key: string,
  id: string
): void {
  const items = getFromStorage<T[]>(key, [])
  const filteredItems = items.filter((item) => item.id !== id)
  saveToStorage(key, filteredItems)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateEntryNumber(id: string): string {
  console.log('🔢 [generateEntryNumber] Appel avec id:', id)
  
  // Utiliser la nouvelle fonction de génération de code base64
  const { generateUniqueCode } = require('@/lib/utils/generateCode')
  const code = generateUniqueCode('TRA', id, 8)
  console.log('🔢 [generateEntryNumber] code généré:', code)
  return code
}

export function generateInvoiceNumber(id: string, type: 'invoice' | 'quote'): string {
  const prefix = type === 'invoice' ? 'FAC' : 'DEV'
  
  // Utiliser la nouvelle fonction de génération de code base64
  const { generateUniqueCode } = require('@/lib/utils/generateCode')
  return generateUniqueCode(prefix, id, 8)
}
