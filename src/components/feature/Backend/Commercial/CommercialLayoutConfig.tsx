'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

export type CommercialSectionId = 'contacts';

const COMMERCIAL_SECTIONS = [
  { id: 'contacts' as const, label: 'Contacts', icon: <Users size={16} /> },
];

interface CommercialLayoutContextType {
  activeSection: CommercialSectionId;
  setActiveSection: (section: CommercialSectionId) => void;
}

const CommercialLayoutContext = createContext<CommercialLayoutContextType | undefined>(undefined);

export function useCommercialLayout() {
  const context = useContext(CommercialLayoutContext);
  if (!context) throw new Error('useCommercialLayout must be used within a CommercialLayoutConfig');
  return context;
}

export function CommercialLayoutConfig({ children }: { children: React.ReactNode }) {
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const [activeSection, setActiveSection] = useState<CommercialSectionId>('contacts');

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard', label: 'Retour au tableau de bord' },
      sections: COMMERCIAL_SECTIONS,
      activeSectionId: activeSection,
      onSectionChange: (id) => setActiveSection(id as CommercialSectionId),
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, setPageSidebarConfig, setMaxWidth]);

  return (
    <CommercialLayoutContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </CommercialLayoutContext.Provider>
  );
}
