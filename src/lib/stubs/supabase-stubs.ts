/**
 * Stubs temporaires pour les fonctions Supabase non encore implementees
 * TODO: Remplacer ces stubs par de vraies implementations
 */

import type { BudgetTemplateWithLines, EventBudgetSummary, BudgetProjectSummary } from '@/types/finance'

// Budget Templates
export const getAllBudgetTemplatesWithLines = async (): Promise<BudgetTemplateWithLines[]> => {
  console.warn('getAllBudgetTemplatesWithLines: stub non implémenté')
  return []
}

export const createBudgetTemplate = async (data: any): Promise<any> => {
  console.warn('createBudgetTemplate: stub non implémenté')
  return { id: 'stub', ...data, lines: [] }
}

export const updateBudgetTemplate = async (id: string, data: any): Promise<any> => {
  console.warn('updateBudgetTemplate: stub non implémenté')
  return { id, ...data, lines: [] }
}

export const deleteBudgetTemplate = async (id: string): Promise<void> => {
  console.warn('deleteBudgetTemplate: stub non implémenté')
}

export const duplicateBudgetTemplate = async (id: string, _newName?: string): Promise<any> => {
  console.warn('duplicateBudgetTemplate: stub non implémenté')
  return { id: `${id}-copy`, lines: [] }
}

// Event Budgets
export const getAllEventsWithBudgets = async ({ year }: { year?: number }): Promise<EventBudgetSummary[]> => {
  console.warn('getAllEventsWithBudgets: stub non implémenté')
  return []
}

export const getEventBudget = async (eventId: string): Promise<any> => {
  console.warn('getEventBudget: stub non implémenté')
  return null
}

export const createEventBudget = async (data: any): Promise<any> => {
  console.warn('createEventBudget: stub non implémenté')
  throw new Error('Non implémenté')
}

export const updateEventBudget = async (id: string, data: any): Promise<any> => {
  console.warn('updateEventBudget: stub non implémenté')
  throw new Error('Non implémenté')
}

export const deleteEventBudget = async (id: string): Promise<void> => {
  console.warn('deleteEventBudget: stub non implémenté')
}

// Budget Projects
export const getAllProjectsWithBudgets = async ({ year }: { year?: number }): Promise<BudgetProjectSummary[]> => {
  console.warn('getAllProjectsWithBudgets: stub non implémenté')
  return []
}

// Treasury Forecasts
export const getTreasuryForecasts = async (filters?: any): Promise<any[]> => {
  console.warn('getTreasuryForecasts: stub non implémenté')
  return []
}

export const createTreasuryForecast = async (data: any): Promise<any> => {
  console.log('createTreasuryForecast (stub):', data)
  return { id: `stub-${Date.now()}`, ...data, created_at: new Date().toISOString() }
}

export const updateTreasuryForecast = async (id: string, data: any): Promise<any> => {
  console.warn('updateTreasuryForecast: stub non implémenté')
  throw new Error('Non implémenté')
}

export const deleteTreasuryForecast = async (id: string): Promise<void> => {
  console.warn('deleteTreasuryForecast: stub non implémenté')
}

export const realizeTreasuryForecast = async (id: string, transactionId: string): Promise<any> => {
  console.warn('realizeTreasuryForecast: stub non implémenté')
  throw new Error('Non implémenté')
}

// Recurring Transactions
export const getRecurringTransactions = async (): Promise<any[]> => {
  console.warn('getRecurringTransactions: stub non implémenté')
  return []
}

export const toggleRecurringTransactionActive = async (id: string): Promise<any> => {
  console.warn('toggleRecurringTransactionActive: stub non implémenté')
  throw new Error('Non implémenté')
}

export const deleteRecurringTransaction = async (id: string): Promise<void> => {
  console.warn('deleteRecurringTransaction: stub non implémenté')
}

export const generateRecurringTransactions = async (recurringId?: string): Promise<number> => {
  console.warn('generateRecurringTransactions: stub non implémenté', recurringId)
  return 0
}

// Hooks
export const useEvents = () => ({ data: [] as any[], isLoading: false })
export const useCommercialContacts = () => ({ data: [] as any[], isLoading: false })
export const useTransactionsTags = (ids: string[]) => ({ data: {} as Record<string, any[]> })
export const useTransactionLinks = (ids: string[]) => ({ 
  data: { events: {}, projects: {}, contacts: {} } as any 
})
export const useUpdateTransactionTags = () => ({
  mutateAsync: async (data: { transactionId: string; tagIds: string[] }) => {
    console.warn('useUpdateTransactionTags: stub non implémenté', data)
    return { success: true }
  },
  isLoading: false,
})

// Export default supabase client stub
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null })
  },
  storage: {
    from: (bucket: string) => ({
      upload: async () => ({ data: null, error: new Error('Supabase not configured') })
    })
  }
}
