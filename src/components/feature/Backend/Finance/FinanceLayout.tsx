"use client";

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Receipt,
  PieChart,
  FileText,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';

export type FinanceSectionId = 'tresorerie' | 'transactions' | 'budget' | 'factures' | 'bilan';

interface FinanceSidebarSection {
  id: FinanceSectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
}

const FINANCE_SECTIONS: FinanceSidebarSection[] = [
  { id: 'tresorerie',   label: 'Trésorerie',   icon: <Wallet size={16} />,    headerIcon: <Wallet size={28} /> },
  { id: 'transactions', label: 'Transactions', icon: <Receipt size={16} />,   headerIcon: <Receipt size={28} /> },
  { id: 'budget',       label: 'Budget',       icon: <PieChart size={16} />,  headerIcon: <PieChart size={28} /> },
  { id: 'factures',     label: 'Factures',     icon: <FileText size={16} />,  headerIcon: <FileText size={28} /> },
  { id: 'bilan',        label: 'Bilan',        icon: <BarChart3 size={16} />, headerIcon: <BarChart3 size={28} /> },
];

const AVAILABLE_YEARS = [2023, 2024, 2025, 2026];

interface FinanceLayoutContextType {
  activeSection: FinanceSectionId;
  setActiveSection: (section: FinanceSectionId) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const FinanceLayoutContext = createContext<FinanceLayoutContextType | undefined>(undefined);

export function useFinanceLayout() {
  const context = useContext(FinanceLayoutContext);
  if (!context) throw new Error('useFinanceLayout must be used within a FinanceLayout');
  return context;
}

export function FinanceLayout({ children }: { children: React.ReactNode }) {
  const { toolbar } = useToolbar();

  const [activeSection, setActiveSection] = useState<FinanceSectionId>('tresorerie');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearSelectorOpen, setYearSelectorOpen] = useState(false);

  const activeConfig = FINANCE_SECTIONS.find(s => s.id === activeSection);

  return (
    <FinanceLayoutContext.Provider value={{ activeSection, setActiveSection, selectedYear, setSelectedYear }}>
      <div className="flex min-h-[calc(100vh-60px)]">

        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
          <div className="p-4 space-y-4">

            <div>
              {/* Year selector */}
              <div className="mb-3 relative">
                <button
                  onClick={() => setYearSelectorOpen(o => !o)}
                  className={cn(
                    'w-full flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-left transition-colors group',
                    yearSelectorOpen
                      ? 'bg-zinc-100 dark:bg-zinc-800 border border-border-custom'
                      : 'border border-border-custom hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                  )}
                >
                  <span className="font-bold text-sm truncate">Année {selectedYear}</span>
                  <ChevronDown size={14} className={cn('shrink-0 text-zinc-400 transition-transform', yearSelectorOpen && 'rotate-180')} />
                </button>
                {yearSelectorOpen && (
                  <div className="absolute left-0 top-full mt-1 z-30 w-full bg-card-bg border border-border-custom rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
                    {AVAILABLE_YEARS.map(year => (
                      <button
                        key={year}
                        onClick={() => {
                          setYearSelectorOpen(false);
                          setSelectedYear(year);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
                          year === selectedYear && 'bg-zinc-100 dark:bg-zinc-800 font-medium'
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Section links */}
              <div className="space-y-0.5">
                {FINANCE_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                      activeSection === section.id
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                        : "text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

          {toolbar && (
            <div className="sticky top-0 z-20 shrink-0">
              {toolbar}
            </div>
          )}

          <div className="flex-1 p-6 md:p-8">
            {activeConfig && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  {activeConfig.headerIcon}
                  {activeConfig.label}
                </h2>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </FinanceLayoutContext.Provider>
  );
}
