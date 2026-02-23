'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { UserCircle, UserCog, Lock } from 'lucide-react';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

type SectionId = 'profil' | 'informations' | 'securite';

const SECTION_GROUPS = [
  {
    title: 'Mon Profil',
    sections: [
      { id: 'profil' as const, label: 'Profil', icon: <UserCircle size={16} />, slug: '' },
      { id: 'informations' as const, label: 'Informations', icon: <UserCog size={16} />, slug: '/informations' },
      { id: 'securite' as const, label: 'Sécurité', icon: <Lock size={16} />, slug: '/securite' },
    ],
  },
];

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname?.includes('/informations')) return 'informations';
  if (pathname?.includes('/securite')) return 'securite';
  return 'profil';
}

export function ProfileLayoutConfig({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const activeSection = getActiveSectionFromPath(pathname ?? '');

  useEffect(() => {
    setMaxWidth('4xl');
    setPageSidebarConfig({
      sectionGroups: SECTION_GROUPS,
      activeSectionId: activeSection,
      basePath: '/dashboard/profile',
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, setPageSidebarConfig, setMaxWidth]);

  return <>{children}</>;
}
