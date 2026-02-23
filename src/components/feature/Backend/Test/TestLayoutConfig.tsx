'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FlaskConical, AlertCircle, Layers, Layers2, Layers3, BookOpen } from 'lucide-react';
import {
  EntitySelectorDropdown,
  SidebarCard,
} from '@/components/ui';
import { getAvailableYears } from '@/lib/years';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import { useChatPanel } from '@/components/providers/ChatPanelProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

export type TestSectionId = 'demo' | 'alertes' | 'atoms' | 'molecules' | 'organisms' | 'reference';

export interface TestSectionConfig {
  id: TestSectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
  subtitle?: string;
}

export const TEST_SECTIONS: TestSectionConfig[] = [
  { id: 'demo', label: 'Démo', icon: <FlaskConical size={16} />, headerIcon: <FlaskConical size={28} /> },
  { id: 'alertes', label: 'Alertes', icon: <AlertCircle size={16} />, headerIcon: <AlertCircle size={28} /> },
  {
    id: 'atoms',
    label: 'Atoms',
    icon: <Layers size={16} />,
    headerIcon: <Layers size={28} />,
    subtitle: 'Tous les composants atoms du design system avec leurs variantes, en mise en situation.',
  },
  {
    id: 'molecules',
    label: 'Molecules',
    icon: <Layers2 size={16} />,
    headerIcon: <Layers2 size={28} />,
    subtitle: 'Tous les composants molecules du design system avec leurs variantes, en mise en situation.',
  },
  {
    id: 'organisms',
    label: 'Organisms',
    icon: <Layers3 size={16} />,
    headerIcon: <Layers3 size={28} />,
    subtitle: 'Tous les composants organisms du design system.',
  },
  { id: 'reference', label: 'Référence', icon: <BookOpen size={16} />, headerIcon: <BookOpen size={28} /> },
];

interface TestLayoutContextType {
  activeSection: TestSectionId;
  setActiveSection: (section: TestSectionId) => void;
  pageAlert: { variant: 'info' | 'warning' | 'error' | 'success'; message: string } | null;
  setPageAlert: (alert: TestLayoutContextType['pageAlert']) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const TestLayoutContext = createContext<TestLayoutContextType | undefined>(undefined);

export function useTestLayout() {
  const context = useContext(TestLayoutContext);
  if (!context) throw new Error('useTestLayout must be used within a TestLayoutConfig');
  return context;
}

const toSidebarSection = (s: TestSectionConfig) => ({
  id: s.id,
  label: s.label,
  icon: s.icon,
});

const PAGE_SIDEBAR_SECTION_GROUPS = [
  {
    sections: TEST_SECTIONS.filter((s) =>
      ['demo', 'alertes', 'reference'].includes(s.id)
    ).map(toSidebarSection),
  },
  {
    title: 'Design System',
    sections: TEST_SECTIONS.filter((s) =>
      ['atoms', 'molecules', 'organisms'].includes(s.id)
    ).map(toSidebarSection),
  },
];

export function TestLayoutConfig({ children }: { children: React.ReactNode }) {
  const { setPageSidebarConfig } = usePageSidebar();
  const { setAlert } = useAlert();
  const { setChatPanelConfig } = useChatPanel();
  const { setMaxWidth } = usePageLayout();

  const [activeSection, setActiveSection] = useState<TestSectionId>('demo');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [pageAlert, setPageAlert] = useState<TestLayoutContextType['pageAlert']>({
    variant: 'info',
    message:
      "Ceci est une page de test pour valider le layout unifié. Zone d'alerte au-dessus de la toolbar.",
  });

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
      sectionGroups: PAGE_SIDEBAR_SECTION_GROUPS,
      activeSectionId: activeSection,
      onSectionChange: (id) => setActiveSection(id as TestSectionId),
      children: (
        <div className="mt-4 space-y-2">
          <SidebarCard
            icon={FlaskConical}
            title="Layout de référence"
            subtitle="Source de vérité"
          />
        </div>
      ),
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, selectedYear, setPageSidebarConfig, setMaxWidth]);

  useEffect(() => {
    setAlert(
      pageAlert
        ? {
            variant: pageAlert.variant,
            message: pageAlert.message,
            onDismiss: () => setPageAlert(null),
          }
        : null
    );
    return () => setAlert(null);
  }, [pageAlert, setAlert]);

  useEffect(() => {
    setChatPanelConfig({
      comments: [],
      onSendComment: () => {},
    });
    return () => setChatPanelConfig(null);
  }, [setChatPanelConfig]);

  return (
    <TestLayoutContext.Provider
      value={{
        activeSection,
        setActiveSection,
        pageAlert,
        setPageAlert,
        selectedYear,
        setSelectedYear,
      }}
    >
      {children}
    </TestLayoutContext.Provider>
  );
}
