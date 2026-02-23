'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PageSidebarConfig } from '@/config/page-layout';

export interface PageSidebarContextValue extends PageSidebarConfig {
  activeSectionId: string;
  onSectionChange?: (id: string) => void;
}

interface PageSidebarContextType {
  config: PageSidebarContextValue | null;
  setPageSidebarConfig: (config: PageSidebarContextValue | null) => void;
}

const PageSidebarContext = createContext<PageSidebarContextType | undefined>(undefined);

/**
 * PageSidebarProvider - Config de la PageSidebar.
 * La page fournit sections, entitySelector, activeSectionId, onSectionChange.
 */
export function PageSidebarProvider({ children }: { children: ReactNode }) {
  const [config, setPageSidebarConfig] = useState<PageSidebarContextValue | null>(null);

  return (
    <PageSidebarContext.Provider value={{ config, setPageSidebarConfig }}>
      {children}
    </PageSidebarContext.Provider>
  );
}

export function usePageSidebar() {
  const context = useContext(PageSidebarContext);
  if (context === undefined) {
    throw new Error('usePageSidebar must be used within a PageSidebarProvider');
  }
  return context;
}
