'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Palette, Bell } from 'lucide-react';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

type SectionId = 'apparence' | 'notifications';

const SECTION_GROUPS = [
  {
    title: 'Paramètres',
    sections: [
      { id: 'apparence' as const, label: 'Apparence', icon: <Palette size={16} />, slug: '/apparence' },
      { id: 'notifications' as const, label: 'Notifications', icon: <Bell size={16} />, slug: '/notifications' },
    ],
  },
];

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname?.includes('/notifications')) return 'notifications';
  return 'apparence';
}

export function SettingsLayoutConfig({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const activeSection = getActiveSectionFromPath(pathname ?? '');

  useEffect(() => {
    setMaxWidth('4xl');
    setPageSidebarConfig({
      sectionGroups: SECTION_GROUPS,
      activeSectionId: activeSection,
      basePath: '/dashboard/settings',
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, setPageSidebarConfig, setMaxWidth]);

  return <>{children}</>;
}
