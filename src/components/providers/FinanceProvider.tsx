'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'

interface FinanceContextValue {
  refreshTrigger: number
  triggerRefresh: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }
  
  return (
    <FinanceContext.Provider value={{ refreshTrigger, triggerRefresh, isLoading, setIsLoading }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
