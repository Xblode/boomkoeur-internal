'use client';

import React, { useEffect, useMemo } from 'react';
import { CalendarDays, ClipboardList, FileText, MapPin, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { SidebarCard } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { useCalendarDataContext } from '@/components/providers/CalendarDataProvider';

interface CalendarLayoutConfigProps {
  children: React.ReactNode;
}

export function CalendarLayoutConfig({ children }: CalendarLayoutConfigProps) {
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth, setFullBleed } = usePageLayout();
  const { events, meetings, items } = useCalendarDataContext();

  const now = new Date();

  const nextEvent = useMemo(() => {
    return events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
  }, [events]);

  const nextMeeting = useMemo(() => {
    return meetings
      .filter((m) => new Date(m.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
  }, [meetings]);

  const todayPosts = useMemo(() => {
    const today = new Date();
    return items.filter((item) => item.type === 'post' && isSameDay(item.date, today));
  }, [items]);

  const sidebarContent = (
    <>
      <div className="space-y-3">
        <SidebarCard
          icon={CalendarDays}
          title="Prochain événement"
          href={nextEvent ? `/dashboard/events/${nextEvent.id}` : undefined}
          iconClassName="text-purple-500"
        >
          {nextEvent ? (
            <div>
              <p className="text-sm font-medium truncate">{nextEvent.name}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                <Clock size={10} />
                <span>{format(new Date(nextEvent.date), "d MMM 'à' HH:mm", { locale: fr })}</span>
              </div>
              {nextEvent.location && (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                  <MapPin size={10} />
                  <span className="truncate">{nextEvent.location}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Aucun événement à venir</p>
          )}
        </SidebarCard>

        <SidebarCard
          icon={ClipboardList}
          title="Prochaine réunion"
          href={nextMeeting ? `/dashboard/meetings/${nextMeeting.id}` : undefined}
          iconClassName="text-blue-500"
        >
          {nextMeeting ? (
            <div>
              <p className="text-sm font-medium truncate">{nextMeeting.title}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                <Clock size={10} />
                <span>{format(new Date(nextMeeting.date), "d MMM", { locale: fr })} {nextMeeting.startTime}</span>
              </div>
              {nextMeeting.location && (
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                  <MapPin size={10} />
                  <span className="truncate">{nextMeeting.location}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Aucune réunion à venir</p>
          )}
        </SidebarCard>

        <SidebarCard icon={FileText} title="À faire aujourd'hui" iconClassName="text-amber-500">
          {todayPosts.length > 0 ? (
            <div className="space-y-2">
              {todayPosts.map((item) => (
                <Link
                  key={item.id}
                  href={item.href ?? '#'}
                  className="block p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  {item.time && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} />
                      <span className="text-[10px] text-zinc-400">{item.time}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Rien de programmé aujourd&apos;hui</p>
          )}
        </SidebarCard>
      </div>
    </>
  );

  useEffect(() => {
    setMaxWidth('7xl');
    setFullBleed(true);
    setPageSidebarConfig({
      customContent: sidebarContent,
      activeSectionId: '',
    });
    return () => {
      setPageSidebarConfig(null);
      setFullBleed(false);
    };
  }, [nextEvent, nextMeeting, todayPosts, setPageSidebarConfig, setMaxWidth, setFullBleed]);

  return <>{children}</>;
}
