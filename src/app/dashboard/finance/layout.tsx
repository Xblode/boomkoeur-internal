'use client';

import { useEffect } from 'react';
import { FinanceProvider } from '@/components/providers';
import { initializeDemoData } from '@/lib/mocks/finance/demoData';
import { FinanceLayoutConfig } from '@/components/feature/Backend/Finance/FinanceLayoutConfig';

export default function FinanceLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <FinanceProvider>
      <FinanceLayoutConfig>{children}</FinanceLayoutConfig>
    </FinanceProvider>
  );
}
