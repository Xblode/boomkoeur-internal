'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting } from '@/types/meeting';
import MeetingsList from '@/components/feature/Backend/Meetings/MeetingsList';
import MeetingForm from '@/components/feature/Backend/Meetings/MeetingForm';
import { meetingService } from '@/lib/services/MeetingService';
import { Button } from '@/components/ui/atoms';
import { Plus } from 'lucide-react';

export default function MeetingsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Réunions</h1>
          <p className="text-muted-foreground">
            Gérez vos réunions et comptes-rendus
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleCreateMeeting} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Création...' : 'Nouvelle réunion'}
        </Button>
      </div>

      {/* Meetings List */}
      <MeetingsList
        onEditMeeting={handleEditMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        refreshTrigger={refreshKey}
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
