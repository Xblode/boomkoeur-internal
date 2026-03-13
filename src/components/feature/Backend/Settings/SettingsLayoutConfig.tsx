'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Palette, Bell } from 'lucide-react';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

type SectionId = 'apparence' | 'notifications';

const SECTIONS = [
  { id: 'apparence' as const, label: 'Apparence', icon: <Palette size={16} />, slug: '' },
  { id: 'notifications' as const, label: 'Notifications', icon: <Bell size={16} />, slug: '/notifications' },
] as const;

const SECTION_GROUPS = [{ title: 'Paramètres', sections: SECTIONS }];

const BASE_PATH = '/dashboard/settings';

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname?.includes('/notifications')) return 'notifications';
  return 'apparence';
}

export function SettingsLayoutConfig({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const activeSection = getActiveSectionFromPath(pathname ?? '');
  const activeSectionData = SECTIONS.find((s) => s.id === activeSection);

  useEffect(() => {
    setMaxWidth('4xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard', label: 'Retour au dashboard' },
      mobileHeaderSelector: (
        <EntitySelectorDropdown<(typeof SECTIONS)[number]>
          value={activeSectionData ?? null}
          options={[...SECTIONS]}
          onSelect={(s) => router.push(BASE_PATH + s.slug)}
          renderValue={(s) => s.label}
          renderOption={(s) => s.label}
          placeholder="Sous-page"
          className="max-w-[180px]"
          variant="ghost"
        />
      ),
      sectionGroups: SECTION_GROUPS.map((g) => ({ title: g.title, sections: g.sections.map((s) => ({ ...s })) })),
      activeSectionId: activeSection,
      basePath: BASE_PATH,
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, activeSectionData, router, setPageSidebarConfig, setMaxWidth]);

  return <>{children}</>;
}
