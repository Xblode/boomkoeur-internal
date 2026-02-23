'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Users, Database, Globe } from 'lucide-react';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

type SectionId = 'general' | 'utilisateurs' | 'migration';

const SECTION_GROUPS = [
  {
    title: 'Administration',
    sections: [
      { id: 'general' as const, label: 'Général', icon: <Globe size={16} />, slug: '/general' },
      { id: 'utilisateurs' as const, label: 'Utilisateurs', icon: <Users size={16} />, slug: '' },
      { id: 'migration' as const, label: 'Migration données', icon: <Database size={16} />, slug: '/migration' },
    ],
  },
];

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname?.includes('/general')) return 'general';
  if (pathname?.includes('/migration')) return 'migration';
  return 'utilisateurs';
}

export function AdminLayoutConfig({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const activeSection = getActiveSectionFromPath(pathname ?? '');

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      sectionGroups: SECTION_GROUPS,
      activeSectionId: activeSection,
      basePath: '/dashboard/admin',
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, setPageSidebarConfig, setMaxWidth]);

  return <>{children}</>;
}
