'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Calendar as CalendarIcon, Video, ArrowUpRight, ChevronRight, ChevronDown, Clock, MapPin, Users, CheckSquare, Ticket, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/atoms';
import { getEntityMissingCount } from '@/lib/messages-entity-config';
import { cn } from '@/lib/utils';
import type { RelatedEntityType } from '@/types/messages';

type AgendaItemInput = string | { title: string; duration?: number; description?: string; responsible?: string };
type EventStatusType = 'idea' | 'preparation' | 'confirmed' | 'completed' | 'archived';

interface BusinessCardProps {
  entityType: RelatedEntityType;
  metadata: Record<string, unknown>;
  /** Intégré dans une bulle (message système) : pas de border, pas de marge */
  embedded?: boolean;
  className?: string;
}

/** scheduledAt ISO string pour savoir si la réunion est passée */
function isMeetingPassed(scheduledAt: string | undefined): boolean {
  if (!scheduledAt) return false;
  return new Date(scheduledAt) < new Date();
}

function EventExpandContent({
  status,
  location,
  artists,
  assignees,
  comPhase,
  nextActions,
  summary,
  date,
  ticketCount,
  shotgunSynced,
}: {
  status?: EventStatusType;
  location?: string;
  artists: string[];
  assignees: string[];
  comPhase?: string;
  nextActions: string[];
  summary?: string;
  date?: string;
  ticketCount?: number;
  shotgunSynced?: boolean;
}) {
  const items: Array<{ icon: React.ElementType; label: string; value: string }> = [];

  if (date) items.push({ icon: CalendarIcon, label: 'Date', value: date });
  if (location) items.push({ icon: MapPin, label: 'Lieu', value: location });
  if (artists.length > 0) items.push({ icon: Users, label: 'Artistes', value: artists.join(', ') });
  if (shotgunSynced && ticketCount != null) {
    items.push({ icon: Ticket, label: 'Billets', value: `${ticketCount} vendu${ticketCount > 1 ? 's' : ''}` });
  } else if (shotgunSynced === false) {
    items.push({ icon: Ticket, label: 'Billetterie', value: 'Non synchronisé avec Shotgun' });
  }
  if (assignees.length > 0) items.push({ icon: Users, label: 'Assignés', value: assignees.join(', ') });
  if (comPhase && (status === 'preparation' || status === 'confirmed')) items.push({ icon: CheckSquare, label: 'Phase', value: comPhase });
  if (summary && (status === 'completed' || status === 'archived')) items.push({ icon: FileText, label: 'Bilan', value: summary });

  const hasNextActions = nextActions.length > 0 && (status === 'idea' || status === 'preparation');

  if (items.length === 0 && !hasNextActions) {
    return <p className="text-sm text-zinc-500 italic">Aucune information disponible.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-2 py-1.5"
          >
            <Icon size={12} className="text-zinc-400 shrink-0" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide shrink-0">{item.label}</span>
            <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{item.value}</span>
          </div>
        );
      })}
      {hasNextActions && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Prochaines étapes</p>
          {nextActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-2 py-1.5"
            >
              <span className="text-[10px] font-semibold text-zinc-400 shrink-0">{i + 1}.</span>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">{action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const entityConfig: Record<RelatedEntityType, { icon: React.ElementType; label: string; color: string; basePath: string }> = {
  post: { icon: FileText, label: 'Post', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30', basePath: '/dashboard/communication' },
  event: { icon: CalendarIcon, label: 'Événement', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30', basePath: '/dashboard/events' },
  meeting: { icon: Video, label: 'Réunion', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30', basePath: '/dashboard/meetings' },
};

export function BusinessCard({ entityType, metadata, embedded, className }: BusinessCardProps) {
  const config = entityConfig[entityType];
  if (!config) return null;

  const [expanded, setExpanded] = useState(false);
  const Icon = config.icon;
  const title = (metadata.title as string) || 'Sans titre';
  const status = metadata.status as string | undefined;
  const date = metadata.date as string | undefined;
  const entityId = metadata.entityId as string | undefined;

  const href = entityId ? `${config.basePath}/${entityId}` : config.basePath;

  const isMeeting = entityType === 'meeting';
  const isEvent = entityType === 'event';
  const scheduledAt = metadata.scheduledAt as string | undefined;
  const meetingPassed = isMeetingPassed(scheduledAt);
  const orderOfDay = metadata.orderOfDay as string | string[] | undefined;
  const report = metadata.report as string | undefined;

  const rawOrderItems = (Array.isArray(orderOfDay) ? orderOfDay : orderOfDay ? [orderOfDay] : []) as AgendaItemInput[];
  const hasOrderOfDay = rawOrderItems.length > 0 && rawOrderItems.some((item) =>
    typeof item === 'string' ? item.trim() !== '' : item.title?.trim() !== ''
  );
  const orderItems: Array<{ title: string; duration?: number; description?: string; responsible?: string }> = rawOrderItems
    .map((item) => typeof item === 'string' ? { title: item } : { title: item.title, duration: item.duration, description: item.description, responsible: item.responsible })
    .filter((item) => item.title.trim() !== '');

  const eventStatus = metadata.eventStatus as EventStatusType | undefined;
  const eventLocation = metadata.location as string | undefined;
  const eventArtists = (metadata.artists as string[] | undefined) ?? [];
  const eventAssignees = (metadata.assignees as string[] | undefined) ?? [];
  const eventComPhase = metadata.comWorkflowPhase as string | undefined;
  const eventNextActions = (metadata.nextActions as string[] | undefined) ?? [];
  const eventSummary = metadata.summary as string | undefined;
  const eventTicketCount = metadata.ticketCount as number | undefined;
  const eventShotgunSynced = metadata.shotgunSynced as boolean | undefined;

  const hasExpandableContent = isMeeting || isEvent;

  const cardContent = (
    <div
      className={cn(
        'flex overflow-hidden transition-colors group w-full min-w-0',
        !embedded && 'mt-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        embedded && 'rounded-lg',
        (isMeeting || isEvent) && 'flex-col',
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2.5 text-sm',
          !embedded && 'px-3 py-2',
          embedded && 'px-4 py-2 rounded-md hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50',
          (isMeeting || isEvent) && 'flex-1'
        )}
      >
        {(isMeeting || isEvent) && hasExpandableContent && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="shrink-0 p-0.5 -ml-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            aria-label={expanded ? 'Replier' : 'Développer'}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <div className={cn('flex items-center justify-center w-7 h-7 rounded-md shrink-0', config.color)}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{config.label}</span>
            {status && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {status}
              </span>
            )}
            {(isMeeting || isEvent) && (() => {
              const missingCount = getEntityMissingCount(entityType, metadata);
              if (missingCount === 0) return null;
              return (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                  <AlertCircle size={10} className="shrink-0" />
                  <span className="sm:hidden">{missingCount}</span>
                  <span className="hidden sm:inline">{missingCount} élément{missingCount > 1 ? 's' : ''} manquant{missingCount > 1 ? 's' : ''}</span>
                </Badge>
              );
            })()}
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{title}</p>
          {date && <p className="text-[11px] text-zinc-400">{date}</p>}
        </div>
        <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
      </Link>

      {(isMeeting || isEvent) && hasExpandableContent && expanded && (
        <div className={cn(
          'border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30',
          embedded ? 'px-4 py-2' : 'px-3 py-2.5'
        )}>
          {isMeeting ? meetingPassed ? (
            <div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                Compte rendu
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {report || 'Aucun compte rendu disponible.'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                Ordre du jour
              </p>
              {hasOrderOfDay ? (
                <div className="space-y-2">
                  {orderItems.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700',
                        'bg-white dark:bg-zinc-800/50 px-2.5 py-2'
                      )}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-semibold text-[10px]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                          {item.title}
                        </p>
                        {(item.duration != null || item.responsible) && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.duration != null && (
                              <span className="flex items-center gap-0.5 text-[11px] text-zinc-500">
                                <Clock size={10} />
                                {item.duration} min
                              </span>
                            )}
                            {item.responsible && (
                              <span className="text-[11px] text-zinc-500">{item.responsible}</span>
                            )}
                          </div>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">Aucun ordre du jour défini.</p>
              )}
            </div>
          ) : isEvent ? (
            <EventExpandContent
              status={eventStatus}
              location={eventLocation}
              artists={eventArtists}
              assignees={eventAssignees}
              comPhase={eventComPhase}
              nextActions={eventNextActions}
              summary={eventSummary}
              date={date}
              ticketCount={eventTicketCount}
              shotgunSynced={eventShotgunSynced}
            />
          ) : null}
        </div>
      )}
    </div>
  );

  return cardContent;
}
