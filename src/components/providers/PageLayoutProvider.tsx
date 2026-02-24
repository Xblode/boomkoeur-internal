'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PageContentMaxWidth } from '@/components/ui/organisms/PageContentLayout';

interface PageLayoutContextType {
  maxWidth: PageContentMaxWidth;
  setMaxWidth: (maxWidth: PageContentMaxWidth) => void;
  fullBleed: boolean;
  setFullBleed: (fullBleed: boolean) => void;
}

const PageLayoutContext = createContext<PageLayoutContextType | undefined>(undefined);

/**
 * PageLayoutProvider - Config de layout (maxWidth, fullBleed, etc.).
 */
export function PageLayoutProvider({ children }: { children: ReactNode }) {
  const [maxWidth, setMaxWidth] = useState<PageContentMaxWidth>('6xl');
  const [fullBleed, setFullBleed] = useState(false);

  return (
    <PageLayoutContext.Provider value={{ maxWidth, setMaxWidth, fullBleed, setFullBleed }}>
      {children}
    </PageLayoutContext.Provider>
  );
}

export function usePageLayout() {
  const context = useContext(PageLayoutContext);
  if (context === undefined) {
    throw new Error('usePageLayout must be used within a PageLayoutProvider');
  }
  return context;
}
