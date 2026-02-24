'use client';

import { FinanceProvider } from '@/components/providers';
import { FinanceLayoutConfig } from '@/components/feature/Backend/Finance/FinanceLayoutConfig';

export default function FinanceLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FinanceProvider>
      <FinanceLayoutConfig>{children}</FinanceLayoutConfig>
    </FinanceProvider>
  );
}
