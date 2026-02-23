'use client';

import { useState, useEffect } from 'react';
import { meetingService } from '@/lib/services/MeetingService';
import { Meeting, MeetingStatus } from '@/types/meeting';
import { CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/atoms';
import MeetingCard from './MeetingCard';
import MeetingCardSkeleton from './MeetingCardSkeleton';
import { useRouter } from 'next/navigation';

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

interface MeetingsListProps {
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meeting: Meeting) => void;
  refreshTrigger?: number;
  statusFilter?: MeetingStatus | 'all';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export default function MeetingsList({
  onEditMeeting,
  onDeleteMeeting,
  refreshTrigger,
  statusFilter = 'upcoming',
  sortField = 'date',
  sortOrder = 'desc',
}: MeetingsListProps) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        {/* Filtres skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-9 w-full rounded" />
          </div>
          <div className="md:col-span-2" />
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-9 w-full rounded" />
            </div>
            <div className="w-24 space-y-1.5">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-9 w-full rounded" />
            </div>
          </div>
        </div>
        {/* Count skeleton */}
        <Skeleton className="h-5 w-32 rounded" />
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MeetingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          {filteredAndSorted.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onView={handleView}
              onEdit={onEditMeeting}
              onDelete={onDeleteMeeting}
              onPresent={handlePresent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
