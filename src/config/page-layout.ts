import type { ReactNode } from 'react';
import type { PageSidebarSection, PageSidebarSectionGroup } from '@/components/ui/organisms/PageSidebar';

export type PageContentMaxWidth = '4xl' | '5xl' | '6xl' | '7xl';

export interface PageSidebarConfig {
  backLink?: { href: string; label: string };
  entitySelector?: ReactNode;
  sectionGroups?: PageSidebarSectionGroup[];
  sections?: PageSidebarSection[];
  basePath?: string;
  /** Contenu custom (ex: Calendar) — remplace sections/sectionGroups */
  customContent?: ReactNode;
  /** Enfants optionnels (ex: SidebarCard) */
  children?: ReactNode;
}

export interface PageLayoutConfig {
  pageSidebar?: PageSidebarConfig;
  toolbar?: boolean;
  /** Alert toujours actif (slot présent), contenu via AlertProvider */
  chatPanel?: boolean;
  maxWidth?: PageContentMaxWidth;
}
