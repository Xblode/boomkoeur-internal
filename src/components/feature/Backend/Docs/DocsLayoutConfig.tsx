'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FlaskConical, Plug2, CircleDot, Layers2, Layers3, BookOpen, Table2, MessageSquare } from 'lucide-react';
import { SidebarCard } from '@/components/ui';
import { siteConfig } from '@/config/site';
import { Select } from '@/components/ui/atoms';
import { useTheme } from '@/components/providers';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import { useChatPanel } from '@/components/providers/ChatPanelProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

export type DocsSectionId = 'introduction' | 'stack' | 'docs-table' | 'docs-chat' | 'atoms' | 'molecules' | 'organisms' | 'reference';

export interface DocsSectionConfig {
  id: DocsSectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
  subtitle?: string;
}

export const DOCS_SECTIONS: DocsSectionConfig[] = [
  { id: 'introduction', label: 'Introduction', icon: <FlaskConical size={16} />, headerIcon: <FlaskConical size={28} />, subtitle: 'But du site et présentation des différentes pages.' },
  { id: 'stack', label: 'Stack & Intégrations', icon: <Plug2 size={16} />, headerIcon: <Plug2 size={28} />, subtitle: 'Technologies utilisées et intégrations tierces.' },
  {
    id: 'atoms',
    label: 'Atoms',
    icon: <CircleDot size={16} />,
    headerIcon: <CircleDot size={28} />,
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
  {
    id: 'docs-table',
    label: 'Table',
    icon: <Table2 size={16} />,
    headerIcon: <Table2 size={28} />,
    subtitle: 'Documentation du composant Table : options, exemples et référence.',
  },
  {
    id: 'docs-chat',
    label: 'Chat',
    icon: <MessageSquare size={16} />,
    headerIcon: <MessageSquare size={28} />,
    subtitle: 'Documentation du module Messages : structure, composants et référence.',
  },
];

interface DocsLayoutContextType {
  activeSection: DocsSectionId;
  setActiveSection: (section: DocsSectionId) => void;
  pageAlert: { variant: 'info' | 'warning' | 'error' | 'success'; message: string } | null;
  setPageAlert: (alert: DocsLayoutContextType['pageAlert']) => void;
}

const DocsLayoutContext = createContext<DocsLayoutContextType | undefined>(undefined);

export function useDocsLayout() {
  const context = useContext(DocsLayoutContext);
  if (!context) throw new Error('useDocsLayout must be used within a DocsLayoutConfig');
  return context;
}

const SLUG_MAP: Record<DocsSectionId, string> = {
  introduction: '/presentation/introduction',
  stack: '/presentation/stack',
  reference: '/presentation/reference',
  'docs-table': '/table',
  'docs-chat': '/chat',
  atoms: '/design-system/atoms',
  molecules: '/design-system/molecules',
  organisms: '/design-system/organisms',
};

const toSidebarSection = (s: DocsSectionConfig) => ({
  id: s.id,
  label: s.label,
  icon: s.icon,
  slug: SLUG_MAP[s.id],
});

const PAGE_SIDEBAR_SECTION_GROUPS = [
  {
    sections: DOCS_SECTIONS.filter((s) =>
      ['introduction', 'stack', 'reference'].includes(s.id)
    ).map(toSidebarSection),
  },
  {
    title: 'Docs',
    sections: DOCS_SECTIONS.filter((s) => s.id === 'docs-table' || s.id === 'docs-chat').map(toSidebarSection),
  },
  {
    title: 'Design System',
    sections: DOCS_SECTIONS.filter((s) =>
      ['atoms', 'molecules', 'organisms'].includes(s.id)
    ).map(toSidebarSection),
  },
];

function getActiveSectionFromPath(pathname: string): DocsSectionId {
  if (pathname?.includes('/presentation/introduction')) return 'introduction';
  if (pathname?.includes('/presentation/stack')) return 'stack';
  if (pathname?.includes('/presentation/reference')) return 'reference';
  if (pathname?.includes('/table')) return 'docs-table';
  if (pathname?.includes('/chat')) return 'docs-chat';
  if (pathname?.includes('/design-system/atoms')) return 'atoms';
  if (pathname?.includes('/design-system/molecules')) return 'molecules';
  if (pathname?.includes('/design-system/organisms')) return 'organisms';
  return 'introduction';
}

export function DocsLayoutConfig({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setAlert } = useAlert();
  const { setChatPanelConfig } = useChatPanel();
  const { setMaxWidth } = usePageLayout();

  const activeSection = getActiveSectionFromPath(pathname ?? '');
  const { palette, mode, setPalette, setMode } = useTheme();
  const [pageAlert, setPageAlert] = useState<DocsLayoutContextType['pageAlert']>(null);

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard', label: 'Retour au dashboard' },
      entitySelector: (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              Palette
            </label>
            <Select
              value={palette}
              onChange={(e) => setPalette(e.target.value as 'neutral' | 'brand')}
              size="sm"
              className="w-full"
              options={[
                { value: 'neutral', label: 'Neutre' },
                { value: 'brand', label: 'Brand' },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
              Mode
            </label>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
              size="sm"
              className="w-full"
              options={[
                { value: 'light', label: 'Clair' },
                { value: 'dark', label: 'Sombre' },
                { value: 'system', label: 'Système' },
              ]}
            />
          </div>
        </div>
      ),
      sectionGroups: PAGE_SIDEBAR_SECTION_GROUPS,
      activeSectionId: activeSection,
      basePath: '/dashboard/docs',
      children: (
        <div className="mt-4 space-y-2">
          <SidebarCard
            icon={FlaskConical}
            title={siteConfig.name}
            subtitle={`v${siteConfig.version}`}
          />
        </div>
      ),
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, palette, mode, setPalette, setMode, setPageSidebarConfig, setMaxWidth, pathname]);

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
    <DocsLayoutContext.Provider
      value={{
        activeSection,
        setActiveSection: () => {}, // no-op, navigation via routes
        pageAlert,
        setPageAlert,
      }}
    >
      {children}
    </DocsLayoutContext.Provider>
  );
}
