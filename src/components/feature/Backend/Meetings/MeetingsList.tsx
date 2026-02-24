'use client';

import { Meeting, MeetingStatus } from '@/types/meeting';
import { CalendarDays } from 'lucide-react';
import MeetingCard from './MeetingCard';
import { EmptyState } from '@/components/ui/molecules';
import { useRouter } from 'next/navigation';

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

interface MeetingsListProps {
  meetings: Meeting[];
  onDeleteMeeting: (meeting: Meeting) => void;
  statusFilter?: MeetingStatus | 'all';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export default function MeetingsList({
  meetings,
  onDeleteMeeting,
  statusFilter = 'upcoming',
  sortField = 'date',
  sortOrder = 'desc',
}: MeetingsListProps) {
  const router = useRouter();

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

  return (
    <div className="space-y-4">
      {/* Count */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredAndSorted.length} réunion{filteredAndSorted.length > 1 ? 's' : ''}
        {filteredAndSorted.length !== meetings.length && ` sur ${meetings.length}`}
      </div>

      {/* Grid */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={meetings.length === 0 ? 'Aucune réunion' : 'Aucune réunion trouvée'}
          description={
            meetings.length === 0
              ? 'Créez votre première réunion pour commencer.'
              : 'Aucune réunion ne correspond à vos critères. Essayez de modifier les filtres.'
          }
          variant="full"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onView={handleView}
              onDelete={onDeleteMeeting}
              onPresent={handlePresent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
