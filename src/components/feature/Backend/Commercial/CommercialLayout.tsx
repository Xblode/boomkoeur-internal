"use client";

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';

export type CommercialSectionId = 'contacts';

interface CommercialSidebarSection {
  id: CommercialSectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
}

const COMMERCIAL_SECTIONS: CommercialSidebarSection[] = [
  { id: 'contacts', label: 'Contacts', icon: <Users size={16} />, headerIcon: <Users size={28} /> },
];

interface CommercialLayoutContextType {
  activeSection: CommercialSectionId;
  setActiveSection: (section: CommercialSectionId) => void;
}

const CommercialLayoutContext = createContext<CommercialLayoutContextType | undefined>(undefined);

export function useCommercialLayout() {
  const context = useContext(CommercialLayoutContext);
  if (!context) throw new Error('useCommercialLayout must be used within a CommercialLayout');
  return context;
}

export function CommercialLayout({ children }: { children: React.ReactNode }) {
  const { toolbar } = useToolbar();

  const [activeSection, setActiveSection] = useState<CommercialSectionId>('contacts');

  const activeConfig = COMMERCIAL_SECTIONS.find((s) => s.id === activeSection);

  return (
    <CommercialLayoutContext.Provider value={{ activeSection, setActiveSection }}>
      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              {/* Section links */}
              <div className="space-y-0.5">
                {COMMERCIAL_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
                      activeSection === section.id
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium'
                        : 'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
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

          <div className="flex-1 p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
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
          </div>
        </main>
      </div>
    </CommercialLayoutContext.Provider>
  );
}
