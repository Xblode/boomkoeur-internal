'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting, MeetingStatus } from '@/types/meeting';
import MeetingsList from '@/components/feature/Backend/Meetings/MeetingsList';
import { MeetingFilters } from '@/components/feature/Backend/Meetings/MeetingFilters';
import { createMeeting, deleteMeeting } from '@/lib/supabase/meetings';
import { Button } from '@/components/ui/atoms';
import { SectionHeader } from '@/components/ui/molecules';
import { Modal, ModalFooter, PageContentLayout } from '@/components/ui/organisms';
import { useMeetings } from '@/hooks';
import { getErrorMessage } from '@/lib/utils';
import { useAlert } from '@/components/providers/AlertProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { Plus, CalendarDays } from 'lucide-react';

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

export default function MeetingsPage() {
  const router = useRouter();
  const { setAlert } = useAlert();
  const { meetings, isLoading, error, refetch } = useMeetings();
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'all'>('upcoming');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const errorMessage = error ? getErrorMessage(error) : null;
  const isConfigError = errorMessage ? /relation.*does not exist|permission denied|JWT/i.test(errorMessage) : false;
  const alertMessage = errorMessage
    ? isConfigError
      ? 'Base de données non configurée. Exécutez les migrations SQL dans Supabase (voir supabase/migrations/).'
      : `Impossible de charger les réunions : ${errorMessage}`
    : null;

  useEffect(() => {
    if (alertMessage) {
      setAlert({
        variant: 'error',
        message: alertMessage,
        onDismiss: () => {
          setAlert(null);
          refetch();
        },
      });
    } else {
      setAlert(null);
    }
    return () => setAlert(null);
  }, [alertMessage, setAlert, refetch]);

  const handleRefresh = () => {
    refetch();
  };

  const handleCreateMeeting = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const now = new Date();
      const newMeeting = await createMeeting({
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

  const handleDeleteClick = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
  };

  const handleConfirmDelete = async () => {
    if (!meetingToDelete) return;
    try {
      await deleteMeeting(meetingToDelete.id);
      handleRefresh();
      setMeetingToDelete(null);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <PageContentLayout
      embedded
      sectionHeader={
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
      }
    >
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          Chargement des réunions...
        </div>
      )}

      {!isLoading && (
        <MeetingsList
          meetings={meetings}
          onDeleteMeeting={handleDeleteClick}
          statusFilter={statusFilter}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={!!meetingToDelete}
        onClose={() => setMeetingToDelete(null)}
        title="Supprimer la réunion"
        size="sm"
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          Êtes-vous sûr de vouloir supprimer la réunion{' '}
          <strong className="text-zinc-900 dark:text-zinc-100">&quot;{meetingToDelete?.title}&quot;</strong> ? Cette action est irréversible.
        </p>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setMeetingToDelete(null)}>
            Annuler
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </PageContentLayout>
  );
}
