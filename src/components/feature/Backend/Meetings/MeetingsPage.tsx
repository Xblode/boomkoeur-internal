'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting, MeetingStatus } from '@/types/meeting';
import MeetingsList from '@/components/feature/Backend/Meetings/MeetingsList';
import MeetingForm from '@/components/feature/Backend/Meetings/MeetingForm';
import { MeetingFilters } from '@/components/feature/Backend/Meetings/MeetingFilters';
import { meetingService } from '@/lib/services/MeetingService';
import { Button } from '@/components/ui/atoms';
import { SectionHeader } from '@/components/ui/molecules';
import { Plus, CalendarDays } from 'lucide-react';

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

export default function MeetingsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>('upcoming');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateMeeting = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const now = new Date();
      const newMeeting = await meetingService.createMeeting({
        title: 'Nouvelle Réunion',
        date: now,
        startTime: '09:00',
        endTime: '10:00',
        status: 'upcoming',
        participants: [],
        agenda: [],
        minutes: { freeText: '' },
      });
      router.push(`/dashboard/meetings/${newMeeting.id}`);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setIsCreating(false);
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    if (!confirm(`Supprimer la réunion "${meeting.title}" ?`)) return;

    try {
      await meetingService.deleteMeeting(meeting.id);
      handleRefresh();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="w-full space-y-4">
      <SectionHeader
        icon={<CalendarDays size={28} />}
        title="Réunions"
        subtitle="Gérez vos réunions et comptes-rendus"
        actions={
          <Button variant="primary" size="sm" onClick={handleCreateMeeting} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Création...' : 'Nouvelle réunion'}
          </Button>
        }
        filters={
          <MeetingFilters
            statusFilter={statusFilter}
            sortField={sortField}
            sortOrder={sortOrder}
            onStatusFilterChange={setStatusFilter}
            onSortChange={(f, o) => { setSortField(f); setSortOrder(o); }}
          />
        }
      />

      <MeetingsList
        onEditMeeting={handleEditMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        refreshTrigger={refreshKey}
        statusFilter={statusFilter}
        sortField={sortField}
        sortOrder={sortOrder}
      />

      {/* Meeting Form Modal (edit only) */}
      <MeetingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleRefresh}
        meeting={editingMeeting}
      />
    </div>
  );
}
