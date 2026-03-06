'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Users, Globe, Plug2, FileText, ScrollText, Crown } from 'lucide-react';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { useOrg } from '@/hooks';

type SectionId = 'general' | 'utilisateurs' | 'statuts' | 'reglement-interieur' | 'presidence' | 'integration' | 'logs';

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname?.includes('/presidence')) return 'presidence';
  if (pathname?.includes('/statuts/reglement-interieur')) return 'reglement-interieur';
  if (pathname?.includes('/statuts')) return 'statuts';
  if (pathname?.includes('/general')) return 'general';
  if (pathname?.includes('/utilisateurs')) return 'utilisateurs';
  if (pathname?.includes('/integration')) return 'integration';
  if (pathname?.includes('/logs')) return 'logs';
  return 'general';
}

export function AdminLayoutConfig({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();
  const { activeOrg, isAdmin } = useOrg();

  const isAssociation = activeOrg?.type === 'association';

  const sectionGroups = useMemo(() => {
    const adminSections: { id: SectionId; label: string; icon: React.ReactNode; slug: string }[] = [
      { id: 'general', label: 'Général', icon: <Globe size={16} />, slug: '/general' },
      { id: 'utilisateurs', label: 'Utilisateurs', icon: <Users size={16} />, slug: '/utilisateurs' },
    ];

    const bureauSections: { id: SectionId; label: string; icon: React.ReactNode; slug: string }[] = [];
    if (isAssociation) {
      bureauSections.push(
        { id: 'statuts', label: 'Statuts', icon: <ScrollText size={16} />, slug: '/statuts' },
        { id: 'reglement-interieur', label: 'Règlement intérieur', icon: <FileText size={16} />, slug: '/statuts/reglement-interieur' },
      );
      if (isAdmin) {
        bureauSections.push(
          { id: 'presidence', label: 'Présidence', icon: <Crown size={16} />, slug: '/presidence' },
        );
      }
    }

    const devSections: { id: SectionId; label: string; icon: React.ReactNode; slug: string }[] = [
      { id: 'integration', label: 'Intégration', icon: <Plug2 size={16} />, slug: '/integration' },
      { id: 'logs', label: 'Logs', icon: <FileText size={16} />, slug: '/logs' },
    ];

    const groups: { title: string; sections: typeof adminSections }[] = [
      { title: 'Administration', sections: adminSections },
      { title: 'Développeur', sections: devSections },
    ];
    if (bureauSections.length > 0) {
      groups.splice(1, 0, { title: 'Bureau', sections: bureauSections });
    }
    return groups;
  }, [isAssociation, isAdmin]);

  const activeSection = getActiveSectionFromPath(pathname ?? '');

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      sectionGroups,
      activeSectionId: activeSection,
      basePath: '/dashboard/admin',
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, setPageSidebarConfig, setMaxWidth, sectionGroups]);

  return <>{children}</>;
}
