'use client'

import { useEffect } from 'react'
import { FinanceProvider } from '@/components/providers'
import { initializeDemoData } from '@/lib/mocks/finance/demoData'
import FinancePage from '@/components/feature/Backend/Finance/FinancePage'
import { FinanceLayout } from '@/components/feature/Backend/Finance/FinanceLayout'

export default function Finance() {
  useEffect(() => {
    initializeDemoData()
  }, [])

  return (
    <FinanceProvider>
      <FinanceLayout>
        <FinancePage />
      </FinanceLayout>
    </FinanceProvider>
  )
}
