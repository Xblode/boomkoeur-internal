"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Meeting } from '@/types/meeting';
import { MeetingDetailProvider, useMeetingDetail } from './MeetingDetailProvider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  AlignLeft,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { meetingService } from '@/lib/services/MeetingService';
import Link from 'next/link';

type SectionId = 'info' | 'compte-rendu';

interface SidebarSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
  slug: string;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: 'info',          label: 'Informations',  icon: <AlignLeft size={16} />,  headerIcon: <AlignLeft size={28} />,  slug: '' },
  { id: 'compte-rendu',  label: 'Compte-rendu',  icon: <FileText size={16} />,   headerIcon: <FileText size={28} />,   slug: '/compte-rendu' },
];

function getActiveSectionFromPath(pathname: string, basePath: string): SectionId {
  const relative = pathname.replace(basePath, '');
  if (relative === '/compte-rendu') return 'compte-rendu';
  return 'info';
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { meeting } = useMeetingDetail();
  const { toolbar } = useToolbar();

  const basePath = `/dashboard/meetings/${meeting.id}`;

  // Skip layout for presentation mode (it has its own fullscreen layout)
  if (pathname.includes('/present')) {
    return <>{children}</>;
  }

  const activeSection = getActiveSectionFromPath(pathname, basePath);
  const activeConfig = SIDEBAR_SECTIONS.find(s => s.id === activeSection);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    meetingService.getMeetings().then(meetings => {
      setAllMeetings(meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">

          <button
            onClick={() => router.push('/dashboard/meetings')}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground transition-colors w-full px-2 py-1.5 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
          >
            <ArrowLeft size={16} />
            <span>Retour aux réunions</span>
          </button>

          <div className="border-t border-border-custom pt-4">
            {/* Meeting selector */}
            <div className="mb-3 relative">
              <button
                onClick={() => setSelectorOpen((o) => !o)}
                className={cn(
                  'w-full flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-left transition-colors group',
                  selectorOpen
                    ? 'bg-zinc-100 dark:bg-zinc-800 border border-border-custom'
                    : 'border border-border-custom hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                )}
              >
                <span className="font-bold text-sm truncate">{meeting.title}</span>
                <ChevronDown size={14} className={cn('shrink-0 text-zinc-400 transition-transform', selectorOpen && 'rotate-180')} />
              </button>
              {selectorOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-full bg-card-bg border border-border-custom rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
                  {allMeetings.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectorOpen(false);
                        router.push(`/dashboard/meetings/${m.id}`);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col gap-0.5',
                        m.id === meeting.id && 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      <span className="font-medium truncate">{m.title}</span>
                      <span className="text-xs text-zinc-400">{format(new Date(m.date), 'd MMM yyyy', { locale: fr })}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section links */}
            <div className="space-y-0.5">
              {SIDEBAR_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={`${basePath}${section.slug}`}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                      : "text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {toolbar && (
          <div className="sticky top-0 z-20 shrink-0">
            {toolbar}
          </div>
        )}

        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">

            {activeSection !== 'info' && activeConfig && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  {activeConfig.headerIcon}
                  {activeConfig.label}
                </h2>
              </div>
            )}

            {children}

          </div>
        </div>
      </main>
    </div>
  );
}

interface MeetingDetailLayoutProps {
  meetingId: string;
  children: React.ReactNode;
}

export function MeetingDetailLayout({ meetingId, children }: MeetingDetailLayoutProps) {
  const router = useRouter();
  const [initialMeeting, setInitialMeeting] = useState<Meeting | null | undefined>(undefined);

  useEffect(() => {
    meetingService.getMeetingById(meetingId).then(found => {
      setInitialMeeting(found ?? null);
    });
  }, [meetingId]);

  if (initialMeeting === undefined) {
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
      <LayoutInner>{children}</LayoutInner>
    </MeetingDetailProvider>
  );
}
