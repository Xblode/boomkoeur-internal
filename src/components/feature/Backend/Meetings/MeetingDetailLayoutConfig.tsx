'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlignLeft, FileText } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { MeetingDetailProvider, useMeetingDetail } from './MeetingDetailProvider';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { useMeeting, useMeetings } from '@/hooks';

type SectionId = 'info' | 'compte-rendu';

const SIDEBAR_SECTIONS = [
  { id: 'info' as const, label: 'Informations', icon: <AlignLeft size={16} />, slug: '' },
  { id: 'compte-rendu' as const, label: 'Compte-rendu', icon: <FileText size={16} />, slug: '/compte-rendu' },
] as const;

function getActiveSectionFromPath(pathname: string, basePath: string): SectionId {
  const relative = pathname.replace(basePath, '');
  if (relative === '/compte-rendu') return 'compte-rendu';
  return 'info';
}

function MeetingDetailLayoutConfigInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { meeting } = useMeetingDetail();
  const { meetings } = useMeetings();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();

  const basePath = `/dashboard/meetings/${meeting.id}`;
  const activeSection = getActiveSectionFromPath(pathname ?? '', basePath);
  const activeSectionData = SIDEBAR_SECTIONS.find((s) => s.id === activeSection);

  const sidebarConfigRef = useRef({ router, basePath, activeSectionData });
  sidebarConfigRef.current = { router, basePath, activeSectionData };

  const allMeetings = useMemo(
    () => [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [meetings]
  );
  const meetingForSelector = useMemo(
    () => allMeetings.find((m) => m.id === meeting.id) ?? meeting,
    [allMeetings, meeting]
  );

  useEffect(() => {
    const { router: r, basePath: bp, activeSectionData: sec } = sidebarConfigRef.current;
    setMaxWidth('5xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard/meetings', label: 'Retour aux réunions' },
      entitySelector: (
        <EntitySelectorDropdown<Meeting>
          value={meetingForSelector}
          options={allMeetings}
          onSelect={(m) => router.push(`/dashboard/meetings/${m.id}`)}
          renderValue={(m) => m.title}
          renderOption={(m) => (
            <>
              <span className="font-medium truncate block">{m.title}</span>
              <span className="text-xs text-zinc-400">{format(new Date(m.date), 'd MMM yyyy', { locale: fr })}</span>
            </>
          )}
          placeholder="Sélectionner une réunion"
        />
      ),
      mobileHeaderSelector: (
        <EntitySelectorDropdown<(typeof SIDEBAR_SECTIONS)[number]>
          value={sec ?? null}
          options={[...SIDEBAR_SECTIONS]}
          onSelect={(s) => r.push(bp + (s.slug || ''))}
          renderValue={(s) => s.label}
          renderOption={(s) => s.label}
          placeholder="Sous-page"
          className="max-w-[180px]"
          variant="ghost"
        />
      ),
      sections: [...SIDEBAR_SECTIONS],
      activeSectionId: activeSection,
      basePath,
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, basePath, meetingForSelector, allMeetings, router, setPageSidebarConfig, setMaxWidth]);

  return <>{children}</>;
}

interface MeetingDetailLayoutConfigProps {
  meetingId: string;
  children: React.ReactNode;
}

export function MeetingDetailLayoutConfig({ meetingId, children }: MeetingDetailLayoutConfigProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { meeting: initialMeeting, isLoading } = useMeeting(meetingId);

  if (pathname?.includes('/present')) {
    return <>{children}</>;
  }

  if (isLoading || initialMeeting === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  if (initialMeeting === null) {
    router.replace('/dashboard/meetings');
    return null;
  }

  return (
    <MeetingDetailProvider key={meetingId} initialMeeting={initialMeeting}>
      <MeetingDetailLayoutConfigInner>{children}</MeetingDetailLayoutConfigInner>
    </MeetingDetailProvider>
  );
}
