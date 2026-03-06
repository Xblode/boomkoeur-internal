'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/molecules';
import { Progress } from '@/components/ui/atoms';
import { Event } from '@/types/event';
import {
  Check,
  FileText,
  Megaphone,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Shield,
  Music2,
  Send,
} from 'lucide-react';
import { useEventDetail } from './EventDetailProvider';

interface Milestone {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
}

interface EventProgressTimelineProps {
  event?: Event;
  className?: string;
}

const MILESTONE_DESCRIPTIONS: Record<string, string> = {
  creation:
    "L'événement a été créé. Vous pouvez maintenant le configurer et lancer la préparation de la campagne.",
  brief:
    "Remplissez le brief de campagne pour définir les objectifs, le ton et les cibles. C'est la base de toute votre communication.",
  artistes:
    "Ajoutez les artistes qui se produiront lors de l'événement. Ces informations seront utilisées pour les visuels et les posts.",
  posts:
    "Préparez la liste des posts à publier : calendrier éditorial, visuels et textes. Tout doit être prêt avant le lancement.",
  lancementCom:
    "Lancement officiel : premier post publié, Linktree mis à jour et événement Facebook créé. La campagne est visible au public.",
  security:
    "Contactez les équipes de sécurité pour les informer de l'événement et des mesures prévues.",
  jourJ:
    "C'est le jour J ! L'événement a lieu. Pensez à publier les derniers posts et à suivre l'activité en direct.",
};

export function EventProgressTimeline({ event: eventProp, className }: EventProgressTimelineProps) {
  const ctx = useEventDetail();
  const event = eventProp ?? ctx.event;
  const [viewedIndex, setViewedIndex] = useState<number | null>(null);

  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isEventDayPassed = eventDate.getTime() <= today.getTime();

  const hasBrief = Boolean(event.brief?.trim());
  const hasArtists = (event.artists?.length ?? 0) > 0;
  const posts = event.comWorkflow?.posts ?? [];
  const hasPosts = posts.length > 0;
  const securityContacted = event.comWorkflow?.manual?.securityContacted ?? false;
  const manual = event.comWorkflow?.manual ?? {};
  const lancementCom =
    !!manual.firstPostPublished && !!manual.linktreeUpdated && !!manual.facebookEventCreated;

  const milestones: Milestone[] = [
    {
      id: 'creation',
      label: "Création de l'event",
      description: MILESTONE_DESCRIPTIONS.creation,
      icon: <Calendar size={20} />,
      isCompleted: true,
    },
    {
      id: 'brief',
      label: 'Brief rempli (lancement campagne)',
      description: MILESTONE_DESCRIPTIONS.brief,
      icon: <FileText size={20} />,
      isCompleted: hasBrief,
    },
    {
      id: 'artistes',
      label: 'Ajouter les artistes',
      description: MILESTONE_DESCRIPTIONS.artistes,
      icon: <Music2 size={20} />,
      isCompleted: hasArtists,
    },
    {
      id: 'posts',
      label: 'Liste des posts',
      description: MILESTONE_DESCRIPTIONS.posts,
      icon: <Megaphone size={20} />,
      isCompleted: !!hasPosts,
    },
    {
      id: 'lancementCom',
      label: 'Lancement de la communication',
      description: MILESTONE_DESCRIPTIONS.lancementCom,
      icon: <Send size={20} />,
      isCompleted: lancementCom,
    },
    {
      id: 'security',
      label: 'Contacter la sécurité',
      description: MILESTONE_DESCRIPTIONS.security,
      icon: <Shield size={20} />,
      isCompleted: securityContacted,
    },
    {
      id: 'jourJ',
      label: 'Jour J',
      description: MILESTONE_DESCRIPTIONS.jourJ,
      icon: <Calendar size={20} />,
      isCompleted: isEventDayPassed,
    },
  ];

  const completedCount = milestones.filter((m) => m.isCompleted).length;

  // Étape actuelle = première non terminée, ou dernière si tout est fait
  const firstIncompleteIndex = milestones.findIndex((m) => !m.isCompleted);
  const currentStepIndex =
    firstIncompleteIndex >= 0 ? firstIncompleteIndex : milestones.length - 1;
  const displayIndex = viewedIndex !== null ? viewedIndex : currentStepIndex;
  const current = milestones[displayIndex];

  const goPrev = () => setViewedIndex((i) => (i === null ? displayIndex - 1 : Math.max(0, i - 1)));
  const goNext = () =>
    setViewedIndex((i) =>
      i === null ? Math.min(displayIndex + 1, milestones.length - 1) : Math.min(i + 1, milestones.length - 1)
    );
  const resetToCurrent = () => setViewedIndex(null);

  const canGoPrev = displayIndex > 0;
  const canGoNext = displayIndex < milestones.length - 1;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Avancement de l&apos;event</h2>
        <span className="text-sm font-medium text-zinc-500">
          {completedCount} / {milestones.length} jalons
        </span>
      </div>

      {/* Carte unique : étape en cours */}
      <Card variant="outline">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
                current.isCompleted
                  ? 'bg-accent/15 text-accent'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              )}
            >
              {current.isCompleted ? <Check size={24} /> : current.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Étape {displayIndex + 1} sur {milestones.length}
                </span>
                {current.isCompleted && (
                  <span className="text-xs font-medium text-accent">Terminé</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{current.label}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <Progress
            value={completedCount}
            max={milestones.length}
            className="h-1 mt-4"
            indicatorClassName="bg-accent rounded-full transition-all duration-500"
          />

          {/* Navigation entre étapes */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  canGoPrev
                    ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    : 'opacity-40 cursor-not-allowed text-zinc-400'
                )}
                aria-label="Étape précédente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  canGoNext
                    ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    : 'opacity-40 cursor-not-allowed text-zinc-400'
                )}
                aria-label="Étape suivante"
              >
                <ChevronRight size={18} />
              </button>
              {viewedIndex !== null && (
                <button
                  type="button"
                  onClick={resetToCurrent}
                  className="text-xs text-accent hover:underline ml-2"
                >
                  Revenir à l&apos;étape actuelle
                </button>
              )}
            </div>
            <Link
              href={`/dashboard/events/${event.id}/campagne`}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Voir la campagne <ChevronRight size={14} />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
