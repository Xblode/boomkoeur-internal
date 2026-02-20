'use client';

import { useState, useEffect } from 'react';
import { meetingService } from '@/lib/services/MeetingService';
import { Meeting, MeetingStatus } from '@/types/meeting';
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  Presentation,
  CalendarDays,
  ListChecks,
} from 'lucide-react';
import { Button, Select, Skeleton } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules/Card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface MeetingsListProps {
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meeting: Meeting) => void;
  refreshTrigger?: number;
}

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

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

export default function MeetingsList({
  onEditMeeting,
  onDeleteMeeting,
  refreshTrigger,
}: MeetingsListProps) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>('upcoming');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadMeetings();
  }, [refreshTrigger]);

  const loadMeetings = async () => {
    setIsLoading(true);
    try {
      const data = await meetingService.getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSorted = [...meetings]
    .filter(m => statusFilter === 'all' || m.status === statusFilter)
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.getTime() - b.date.getTime();
      if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const handleView = (meeting: Meeting) => {
    router.push(`/dashboard/meetings/${meeting.id}`);
  };

  const handlePresent = (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    router.push(`/dashboard/meetings/${meeting.id}/present`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters — même style qu'EventFilters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            Statut
          </label>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MeetingStatus | 'all')}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'upcoming', label: 'À venir' },
              { value: 'completed', label: 'Terminées' },
            ]}
          />
        </div>

        <div className="md:col-span-2" />

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Trier par
            </label>
            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              options={[
                { value: 'date', label: 'Date' },
                { value: 'title', label: 'Titre' },
              ]}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Ordre
            </label>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              options={[
                { value: 'asc', label: '↑ Asc' },
                { value: 'desc', label: '↓ Desc' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredAndSorted.length} réunion{filteredAndSorted.length > 1 ? 's' : ''}
        {filteredAndSorted.length !== meetings.length && ` sur ${meetings.length}`}
      </div>

      {/* Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <CalendarDays className="h-10 w-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucune réunion trouvée</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
            Aucune réunion ne correspond à vos critères. Essayez de modifier les filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((meeting) => {
            const badge = STATUS_BADGE[meeting.status];
            return (
              <Card
                key={meeting.id}
                className="group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full bg-[#1f1f1f] border-zinc-800 hover:shadow-xl"
                onClick={() => handleView(meeting)}
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
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-[#262626] border border-[#313133] rounded-lg px-3 py-2 min-w-[3.5rem]">
                      <span className="text-xs font-medium text-zinc-400 uppercase">
                        {format(meeting.date, 'MMM', { locale: fr })}
                      </span>
                      <span className="text-2xl font-bold text-white leading-none mt-0.5">
                        {format(meeting.date, 'dd', { locale: fr })}
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex items-center gap-2.5 text-sm text-[#939393]">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{meeting.startTime} – {meeting.endTime}</span>
                    </div>
                    {meeting.agenda.length > 0 && (
                      <div className="flex items-center gap-2.5 text-sm text-[#939393]">
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
                      <button
                        type="button"
                        onClick={(e) => handlePresent(e, meeting)}
                        className="p-2 rounded-md text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 transition-colors"
                        title="Présenter"
                      >
                        <Presentation className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEditMeeting(meeting); }}
                        className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteMeeting(meeting); }}
                        className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
