'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Wallet,
  Receipt,
  PieChart,
  FileText,
  BarChart3,
} from 'lucide-react';
import {
  EntitySelectorDropdown,
} from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { getAvailableYears } from '@/lib/years';

export type FinanceSectionId = 'tresorerie' | 'transactions' | 'budget' | 'factures' | 'bilan';

const FINANCE_SECTIONS = [
  { id: 'tresorerie' as const, label: 'Trésorerie', icon: <Wallet size={16} /> },
  { id: 'transactions' as const, label: 'Transactions', icon: <Receipt size={16} /> },
  { id: 'budget' as const, label: 'Budget', icon: <PieChart size={16} /> },
  { id: 'factures' as const, label: 'Factures', icon: <FileText size={16} /> },
  { id: 'bilan' as const, label: 'Bilan', icon: <BarChart3 size={16} /> },
];

interface FinanceLayoutContextType {
  activeSection: FinanceSectionId;
  setActiveSection: (section: FinanceSectionId) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const FinanceLayoutContext = createContext<FinanceLayoutContextType | undefined>(undefined);

export function useFinanceLayout() {
  const context = useContext(FinanceLayoutContext);
  if (!context) throw new Error('useFinanceLayout must be used within a FinanceLayoutConfig');
  return context;
}

export function FinanceLayoutConfig({ children }: { children: React.ReactNode }) {
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const [activeSection, setActiveSection] = useState<FinanceSectionId>('tresorerie');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard', label: 'Retour au dashboard' },
      entitySelector: (
        <EntitySelectorDropdown<number>
          value={selectedYear}
          options={getAvailableYears()}
          onSelect={setSelectedYear}
          renderValue={(v) => `Année ${v}`}
          renderOption={(v) => v}
          placeholder="Sélectionner une année"
        />
      ),
      sections: FINANCE_SECTIONS,
      activeSectionId: activeSection,
      onSectionChange: (id) => setActiveSection(id as FinanceSectionId),
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, selectedYear, setPageSidebarConfig, setMaxWidth]);

  return (
    <FinanceLayoutContext.Provider value={{ activeSection, setActiveSection, selectedYear, setSelectedYear }}>
      {children}
    </FinanceLayoutContext.Provider>
  );
}
