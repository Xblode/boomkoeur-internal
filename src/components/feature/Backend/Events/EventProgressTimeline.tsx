'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Event } from '@/types/event';
import { Check, FileText, Megaphone, Calendar, ChevronRight, Shield, Rocket } from 'lucide-react';
import { useEventDetail } from './EventDetailProvider';

interface Milestone {
  id: string;
  label: string;
  icon: React.ReactNode;
  isCompleted: boolean;
}

interface EventProgressTimelineProps {
  event?: Event;
  className?: string;
}

export function EventProgressTimeline({ event: eventProp, className }: EventProgressTimelineProps) {
  const ctx = useEventDetail();
  const event = eventProp ?? ctx.event;

  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isEventDayPassed = eventDate.getTime() <= today.getTime();

  const hasBrief = Boolean(event.brief?.trim());
  const posts = event.comWorkflow?.posts ?? [];
  const hasPosts = posts.length > 0;
  const securityContacted = event.comWorkflow?.manual?.securityContacted ?? false;
  const manual = event.comWorkflow?.manual ?? {};
  const campagnePrete =
    !!manual.firstPostPublished && !!manual.linktreeUpdated && !!manual.facebookEventCreated;

  const milestones: Milestone[] = [
    {
      id: 'creation',
      label: "Création de l'event",
      icon: <Calendar size={16} />,
      isCompleted: true,
    },
    {
      id: 'brief',
      label: 'Brief rempli (lancement campagne)',
      icon: <FileText size={16} />,
      isCompleted: hasBrief,
    },
    {
      id: 'posts',
      label: 'Liste des posts',
      icon: <Megaphone size={16} />,
      isCompleted: !!hasPosts,
    },
    {
      id: 'campagnePrete',
      label: 'Campagne Prête',
      icon: <Rocket size={16} />,
      isCompleted: campagnePrete,
    },
    {
      id: 'security',
      label: 'Contacter la sécurité',
      icon: <Shield size={16} />,
      isCompleted: securityContacted,
    },
    {
      id: 'jourJ',
      label: 'Jour J',
      icon: <Calendar size={16} />,
      isCompleted: isEventDayPassed,
    },
  ];

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = (completedCount / milestones.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Avancement de l&apos;event</h2>
        <span className="text-sm font-medium text-zinc-500">
          {completedCount} / {milestones.length} jalons
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Milestones slider (scroll horizontal) */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth">
        <div className="flex gap-3 min-w-max">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-colors shrink-0 w-[200px]',
                m.isCompleted
                  ? 'bg-accent/10 border-accent/30 text-foreground'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                  m.isCompleted ? 'bg-accent text-white' : 'bg-zinc-200 dark:bg-zinc-700'
                )}
              >
                {m.isCompleted ? <Check size={16} /> : m.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{m.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {m.isCompleted ? 'Terminé' : 'À faire'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/dashboard/events/${event.id}/campagne`}
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        Voir la campagne <ChevronRight size={14} />
      </Link>
    </div>
  );
}
