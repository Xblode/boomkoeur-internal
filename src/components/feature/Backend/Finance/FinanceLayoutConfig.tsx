'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  { id: 'tresorerie' as const, label: 'Trésorerie', icon: <Wallet size={16} />, href: '/dashboard/finance?section=tresorerie' },
  { id: 'transactions' as const, label: 'Transactions', icon: <Receipt size={16} />, href: '/dashboard/finance?section=transactions' },
  { id: 'budget' as const, label: 'Budget', icon: <PieChart size={16} />, href: '/dashboard/finance?section=budget' },
  { id: 'factures' as const, label: 'Factures', icon: <FileText size={16} />, href: '/dashboard/finance?section=factures' },
  { id: 'bilan' as const, label: 'Bilan', icon: <BarChart3 size={16} />, href: '/dashboard/finance?section=bilan' },
] as const;

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

const VALID_SECTIONS: FinanceSectionId[] = ['tresorerie', 'transactions', 'budget', 'factures', 'bilan'];

export function FinanceLayoutConfig({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth, setFullBleed } = usePageLayout();
  const searchParams = useSearchParams();

  const sectionFromUrl = searchParams.get('section') as FinanceSectionId | null;
  const initialSection =
    sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl) ? sectionFromUrl : 'tresorerie';

  const [activeSection, setActiveSection] = useState<FinanceSectionId>(initialSection);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  const activeSectionData = FINANCE_SECTIONS.find((s) => s.id === activeSection);

  useEffect(() => {
    setMaxWidth('6xl');
    setFullBleed(false);
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
      mobileHeaderSelector: (
        <EntitySelectorDropdown<(typeof FINANCE_SECTIONS)[number]>
          value={activeSectionData ?? null}
          options={[...FINANCE_SECTIONS]}
          onSelect={(s) => router.push(s.href)}
          renderValue={(s) => s.label}
          renderOption={(s) => s.label}
          placeholder="Sous-page"
          className="max-w-[180px]"
          variant="ghost"
        />
      ),
      sections: FINANCE_SECTIONS.map(({ id, label, icon }) => ({ id, label, icon })),
      activeSectionId: activeSection,
      onSectionChange: (id) => setActiveSection(id as FinanceSectionId),
    });
    return () => {
      setPageSidebarConfig(null);
      setFullBleed(false);
    };
  }, [activeSection, activeSectionData, selectedYear, router, setPageSidebarConfig, setMaxWidth, setFullBleed]);

  return (
    <FinanceLayoutContext.Provider value={{ activeSection, setActiveSection, selectedYear, setSelectedYear }}>
      {children}
    </FinanceLayoutContext.Provider>
  );
}
