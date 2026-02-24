'use client';

import { Meeting, MeetingStatus } from '@/types/meeting';
import {
  Clock,
  Users,
  Trash2,
  Presentation,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardDateBadge } from '@/components/ui/molecules';
import { IconButton } from '@/components/ui/atoms';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STATUS_BADGE: Record<MeetingStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'À venir',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  completed: {
    label: 'Terminée',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  },
};

interface MeetingCardProps {
  meeting: Meeting;
  onView: (meeting: Meeting) => void;
  onDelete: (meeting: Meeting) => void;
  onPresent: (e: React.MouseEvent, meeting: Meeting) => void;
}

export default function MeetingCard({
  meeting,
  onView,
  onDelete,
  onPresent,
}: MeetingCardProps) {
  const badge = STATUS_BADGE[meeting.status];

  return (
    <Card
      variant="list"
      className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full hover:shadow-xl"
      onClick={() => onView(meeting)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Title + Status + Date block */}
        <div className="p-4 flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="flex-1 font-bold text-lg text-white leading-tight line-clamp-2 group-hover:text-white/90 transition-colors min-w-0">
                {meeting.title}
              </h3>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
                badge.className
              )}>
                {badge.label}
              </span>
            </div>
            {meeting.location && (
              <p className="text-sm text-zinc-400 font-medium truncate">{meeting.location}</p>
            )}
          </div>

          {/* Date block */}
          <CardDateBadge
            month={format(meeting.date, 'MMM', { locale: fr })}
            day={format(meeting.date, 'dd', { locale: fr })}
          />
        </div>

        {/* Meta */}
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-text-tertiary">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{meeting.startTime} – {meeting.endTime}</span>
          </div>
          {meeting.agenda.length > 0 && (
            <div className="flex items-center gap-2.5 text-sm text-text-tertiary">
              <ListChecks className="h-4 w-4 flex-shrink-0" />
              <span>
                {meeting.agenda.length} point{meeting.agenda.length > 1 ? 's' : ''} à l&apos;ordre du jour
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-white">
            <Users className="h-4 w-4 text-zinc-400" />
            <span className="font-medium">{meeting.participants.length}</span>
            <span className="text-zinc-400 text-xs">
              participant{meeting.participants.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <IconButton
              icon={<Presentation className="h-4 w-4" />}
              ariaLabel="Présenter"
              variant="ghost"
              size="sm"
              onClick={(e) => onPresent(e, meeting)}
              className="p-2 rounded-md text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 transition-colors"
              title="Présenter"
            />
            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              ariaLabel="Supprimer"
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(meeting); }}
              className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              title="Supprimer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
