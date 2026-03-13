'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserCircle, UserCog, Lock } from 'lucide-react';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';

type SectionId = 'profil' | 'informations' | 'securite';

const SECTIONS = [
  { id: 'profil' as const, label: 'Profil', icon: <UserCircle size={16} />, slug: '' },
  { id: 'informations' as const, label: 'Informations', icon: <UserCog size={16} />, slug: '/informations' },
  { id: 'securite' as const, label: 'Sécurité', icon: <Lock size={16} />, slug: '/securite' },
] as const;

const SECTION_GROUPS = [{ title: 'Mon Profil', sections: SECTIONS }];

const BASE_PATH = '/dashboard/profile';

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname?.includes('/informations')) return 'informations';
  if (pathname?.includes('/securite')) return 'securite';
  return 'profil';
}

export function ProfileLayoutConfig({ children }: { children: React.ReactNode }) {
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
          onSelect={(s) => router.push(BASE_PATH + (s.slug || ''))}
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
