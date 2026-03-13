'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

export type CommercialSectionId = 'contacts';

const COMMERCIAL_SECTIONS = [
  { id: 'contacts' as const, label: 'Contacts', icon: <Users size={16} />, href: '/dashboard/commercial' },
] as const;

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
  const router = useRouter();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const [activeSection, setActiveSection] = useState<CommercialSectionId>('contacts');
  const activeSectionData = COMMERCIAL_SECTIONS.find((s) => s.id === activeSection);

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard', label: 'Retour au tableau de bord' },
      mobileHeaderSelector: (
        <EntitySelectorDropdown<(typeof COMMERCIAL_SECTIONS)[number]>
          value={activeSectionData ?? null}
          options={[...COMMERCIAL_SECTIONS]}
          onSelect={(s) => router.push(s.href)}
          renderValue={(s) => s.label}
          renderOption={(s) => s.label}
          placeholder="Sous-page"
          className="max-w-[180px]"
          variant="ghost"
        />
      ),
      sections: COMMERCIAL_SECTIONS.map(({ id, label, icon }) => ({ id, label, icon })),
      activeSectionId: activeSection,
      onSectionChange: (id) => setActiveSection(id as CommercialSectionId),
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, activeSectionData, router, setPageSidebarConfig, setMaxWidth]);

  return (
    <CommercialLayoutContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </CommercialLayoutContext.Provider>
  );
}
