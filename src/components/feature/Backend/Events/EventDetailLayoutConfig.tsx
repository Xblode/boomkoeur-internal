'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Event } from '@/types/event';
import { EventDetailProvider, useEventDetail } from './EventDetailProvider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileImage,
  Music,
  AlignLeft,
  Link as LinkIcon,
  CalendarClock,
  Ticket,
} from 'lucide-react';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { useChatPanel } from '@/components/providers/ChatPanelProvider';
import { getEventById, getEvents, addComment } from '@/lib/localStorage/events';

type SectionId = 'info' | 'campagne' | 'artistes' | 'planning' | 'billetterie' | 'liens';

const SIDEBAR_SECTIONS = [
  { id: 'info' as const, label: 'Informations', icon: <AlignLeft size={16} />, slug: '' },
  { id: 'campagne' as const, label: 'Campagne', icon: <FileImage size={16} />, slug: '/campagne' },
  { id: 'artistes' as const, label: 'Artistes', icon: <Music size={16} />, slug: '/artistes' },
  { id: 'planning' as const, label: 'Planning', icon: <CalendarClock size={16} />, slug: '/planning' },
  { id: 'billetterie' as const, label: 'Billetterie', icon: <Ticket size={16} />, slug: '/billetterie' },
  { id: 'liens' as const, label: 'Éléments liés', icon: <LinkIcon size={16} />, slug: '/elements-lies' },
];

function getActiveSectionFromPath(pathname: string, basePath: string): SectionId {
  const relative = pathname.replace(basePath, '');
  if (relative === '/campagne') return 'campagne';
  if (relative === '/artistes') return 'artistes';
  if (relative === '/planning') return 'planning';
  if (relative === '/billetterie') return 'billetterie';
  if (relative === '/elements-lies') return 'liens';
  return 'info';
}

function EventDetailLayoutConfigInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { event, setEvent } = useEventDetail();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();
  const { setChatPanelConfig } = useChatPanel();

  const basePath = `/dashboard/events/${event.id}`;
  const activeSection = getActiveSectionFromPath(pathname ?? '', basePath);

  const allEvents = useMemo(
    () => getEvents().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  );

  const handleSendComment = (author: string, content: string) => {
    addComment(event.id, author, content);
    const updated = getEventById(event.id);
    if (updated) setEvent(updated);
  };

  useEffect(() => {
    setMaxWidth('5xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard/events', label: 'Retour aux événements' },
      entitySelector: (
        <EntitySelectorDropdown<Event>
          value={allEvents.find((e) => e.id === event.id) ?? event}
          options={allEvents}
          onSelect={(e) => router.push(`/dashboard/events/${e.id}`)}
          renderValue={(e) => e.name}
          renderOption={(e) => (
            <>
              <span className="font-medium truncate block">{e.name}</span>
              <span className="text-xs text-zinc-400">{format(new Date(e.date), 'd MMM yyyy', { locale: fr })}</span>
            </>
          )}
          placeholder="Sélectionner un événement"
        />
      ),
      sections: SIDEBAR_SECTIONS,
      activeSectionId: activeSection,
      basePath,
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, basePath, event, allEvents, router, setPageSidebarConfig, setMaxWidth]);

  useEffect(() => {
    setChatPanelConfig({
      comments: event.comments,
      onSendComment: handleSendComment,
    });
    return () => setChatPanelConfig(null);
  }, [event.id, event.comments, setChatPanelConfig]);

  return <>{children}</>;
}

interface EventDetailLayoutConfigProps {
  eventId: string;
  children: React.ReactNode;
}

export function EventDetailLayoutConfig({ eventId, children }: EventDetailLayoutConfigProps) {
  const router = useRouter();
  const [initialEvent, setInitialEvent] = React.useState<Event | null | undefined>(undefined);

  React.useEffect(() => {
    const found = getEventById(eventId);
    setInitialEvent(found ?? null);
  }, [eventId]);

  if (initialEvent === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  if (initialEvent === null) {
    router.replace('/dashboard/events');
    return null;
  }

  return (
    <EventDetailProvider key={eventId} initialEvent={initialEvent}>
      <EventDetailLayoutConfigInner>{children}</EventDetailLayoutConfigInner>
    </EventDetailProvider>
  );
}
