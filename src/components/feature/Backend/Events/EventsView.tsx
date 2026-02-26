"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, IconButton } from '@/components/ui/atoms';
import { Modal, ModalFooter, PageContentLayout } from '@/components/ui/organisms';
import { SectionHeader, Pagination } from '@/components/ui/molecules';
import { useAlert } from '@/components/providers/AlertProvider';
import { useOrg } from '@/components/providers/OrgProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { Event, EventFilters as EventFiltersType, SortField, SortOrder } from '@/types/event';
import { ShotgunEvent } from '@/types/shotgun';
import { EventsList } from './EventsList';
import { EventFilters } from './EventFilters';
import { EventForm } from './EventForm';
import { ShotgunSearchModal } from './ShotgunSearchModal';
import {
  saveEvent,
  deleteEvent,
  duplicateEvent,
  getArtistsList,
} from '@/lib/supabase/events';
import { useEvents } from '@/hooks/useEvents';
import { getErrorMessage } from '@/lib/utils';
import { Plus, History, X, Ticket, FileText, CalendarDays } from 'lucide-react';
import { createPortal } from 'react-dom';

export const EventsView: React.FC = () => {
  const router = useRouter();
  const { activeOrg } = useOrg();
  const { events, isLoading, error, refetch } = useEvents();
  const [existingArtists, setExistingArtists] = useState<Event['artists']>([]);
  const [filters, setFilters] = useState<EventFiltersType>({
    search: '',
    status: 'all',
    location: '',
    artist: '',
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isShotgunOpen, setIsShotgunOpen] = useState(false);
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pastEventsPage, setPastEventsPage] = useState(1);

  const PAST_EVENTS_PER_PAGE = 3;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    getArtistsList().then(setExistingArtists).catch(() => setExistingArtists([]));
  }, [isFormOpen]);

  const { setAlert } = useAlert();
  const { setMaxWidth } = usePageLayout();

  useEffect(() => {
    setMaxWidth('7xl');
    return () => setMaxWidth('6xl');
  }, [setMaxWidth]);
  const errorMessage = error ? getErrorMessage(error) : null;
  const isConfigError = errorMessage ? /relation.*does not exist|permission denied|JWT/i.test(errorMessage) : false;
  const alertMessage = errorMessage
    ? isConfigError
      ? 'Base de données non configurée. Exécutez les migrations SQL dans Supabase (voir supabase/migrations/).'
      : `Impossible de charger les événements : ${errorMessage}`
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

  // Extraire les lieux et artistes uniques pour les filtres
  const { locations, artists } = useMemo(() => {
    const locationSet = new Set<string>();
    const artistSet = new Set<string>();

    events.forEach((event) => {
      locationSet.add(event.location);
      event.artists.forEach((artist) => artistSet.add(artist.name));
    });

    return {
      locations: Array.from(locationSet).sort(),
      artists: Array.from(artistSet).sort(),
    };
  }, [events]);

  // Filtrer et trier les événements
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Filtre de recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower)
      );
    }

    // Filtre de statut
    if (filters.status !== 'all') {
      filtered = filtered.filter((event) => event.status === filters.status);
    }

    // Filtre de lieu
    if (filters.location) {
      filtered = filtered.filter((event) => event.location === filters.location);
    }

    // Filtre d'artiste
    if (filters.artist) {
      filtered = filtered.filter((event) =>
        event.artists.some((artist) => artist.name === filters.artist)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          const statusOrder = ['idea', 'preparation', 'confirmed', 'completed', 'archived'];
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [events, filters, sortField, sortOrder]);

  // Séparer les événements actifs et passés
  const { activeEvents, pastEvents } = useMemo(() => {
    const active = filteredAndSortedEvents.filter(
      (e) => e.status !== 'completed' && e.status !== 'archived'
    );
    const past = filteredAndSortedEvents.filter(
      (e) => e.status === 'completed' || e.status === 'archived'
    );
    return { activeEvents: active, pastEvents: past };
  }, [filteredAndSortedEvents]);

  // Pagination "Voir plus" des événements passés : 3 de base, puis 3 par 3
  const pastEventsTotalPages = Math.max(1, Math.ceil(pastEvents.length / PAST_EVENTS_PER_PAGE));
  const pastEventsVisible = useMemo(() => {
    const count = pastEventsPage * PAST_EVENTS_PER_PAGE;
    return pastEvents.slice(0, count);
  }, [pastEvents, pastEventsPage]);

  // Réinitialiser la page quand les événements passés changent (filtres)
  useEffect(() => {
    setPastEventsPage(1);
  }, [pastEvents.length]);

  // Handlers
  const handleCreateEvent = () => {
    setIsChoiceOpen(true);
  };

  const handleCreateEmpty = async () => {
    setIsChoiceOpen(false);
    try {
      const newEvent = await saveEvent({
        name: 'Nouvel Événement',
        date: new Date(),
        location: '',
        description: '',
        status: 'idea',
        artists: [],
        linkedElements: [],
        tags: [],
        comments: [],
        comWorkflow: {
          activePhase: 'preparation',
          activeStep: 0,
          manual: {},
          shotgunUrl: '',
          overrides: {},
        },
      });
      await refetch();
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch (err) {
      console.error('Erreur création événement:', err);
    }
  };

  const handleOpenShotgunSearch = () => {
    setIsChoiceOpen(false);
    setIsShotgunOpen(true);
  };

  const handleShotgunSelect = async (sgEvent: ShotgunEvent) => {
    setIsShotgunOpen(false);

    const startDate = new Date(sgEvent.startTime);
    const endDate = new Date(sgEvent.endTime);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setAlert({ variant: 'error', message: 'Les dates de l\'événement Shotgun sont invalides.' });
      return;
    }
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    try {
      const newEvent = await saveEvent({
        name: sgEvent.name,
        date: startDate,
        endTime: endTimeStr,
        location: sgEvent.geolocation?.street || sgEvent.geolocation?.city || '',
        description: sgEvent.description || '',
        status: 'preparation',
        artists: [],
        linkedElements: [],
        tags: sgEvent.genres?.map((g) => g.name) || [],
        comments: [],
        shotgunEventId: sgEvent.id,
        shotgunEventUrl: sgEvent.url,
        media: {
          posterShotgun: sgEvent.coverUrl || undefined,
        },
        comWorkflow: {
          activePhase: 'preparation',
          activeStep: 0,
          manual: { shotgunDone: true },
          shotgunUrl: sgEvent.url,
          overrides: {},
        },
      });
      await refetch();
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Erreur import Shotgun:', msg, err);
      setAlert({ variant: 'error', message: `Erreur import Shotgun : ${msg}` });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id);
      await refetch();
      setEventToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const handleDuplicateEvent = async (id: string) => {
    try {
      await duplicateEvent(id);
      await refetch();
    } catch (err) {
      console.error('Erreur duplication:', err);
    }
  };

  const handleSubmitForm = async (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const statusChangedToCompleted = data.status === 'completed' && editingEvent?.status !== 'completed';
      let saved: Event;

      if (editingEvent) {
        saved = await saveEvent({ ...editingEvent, ...data });
      } else {
        saved = await saveEvent(data);
      }
      await refetch();
      setIsFormOpen(false);
      setEditingEvent(undefined);

      // Créer automatiquement une transaction billetterie quand l'event passe à "terminé"
      if (statusChangedToCompleted && saved.shotgunEventId && saved.id) {
        try {
          const headers: Record<string, string> = {};
          if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
          await fetch(`/api/events/${saved.id}/create-billetterie-transaction`, {
            method: 'POST',
            headers,
          });
        } catch {
          // Silencieux : la transaction peut être créée manuellement
        }
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingEvent(undefined);
  };

  const handleEventClick = (event: Event) => {
    router.push(`/dashboard/events/${event.id}`);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <PageContentLayout
      embedded
      sectionHeader={
        <SectionHeader
          icon={<CalendarDays size={28} />}
          title="Events"
          subtitle="Gérez vos événements et soirées musicales"
          actions={
            <Button variant="primary" size="sm" onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
          }
          filters={
            <EventFilters
              filters={filters}
              sortField={sortField}
              sortOrder={sortOrder}
              onFiltersChange={setFilters}
              onSortChange={handleSortChange}
              locations={locations}
              artists={artists}
            />
          }
        />
      }
    >
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          Chargement des événements...
        </div>
      )}

      {!isLoading && (
        <>
      {/* Compteur */}
      <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
        {filteredAndSortedEvents.length} événement{filteredAndSortedEvents.length > 1 ? 's' : ''}{' '}
        {filteredAndSortedEvents.length !== events.length && `sur ${events.length}`}
      </div>

      {/* Liste des événements actifs */}
      {activeEvents.length > 0 && (
        <EventsList
          events={activeEvents}
          onEdit={handleEditEvent}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicateEvent}
          onClick={handleEventClick}
        />
      )}

      {/* Liste des événements passés (pagination 3 par 3) */}
      {pastEvents.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <History className="h-5 w-5 text-zinc-500" />
            <h2 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
              Événements terminés & archivés
            </h2>
          </div>
          <div className="opacity-75">
            <EventsList
              events={pastEventsVisible}
              onEdit={handleEditEvent}
              onDelete={handleDeleteClick}
              onDuplicate={handleDuplicateEvent}
              onClick={handleEventClick}
            />
          </div>
          {pastEvents.length > PAST_EVENTS_PER_PAGE && pastEventsPage < pastEventsTotalPages && (
            <Pagination
              variant="loadMore"
              currentPage={pastEventsPage}
              totalPages={pastEventsTotalPages}
              totalItems={pastEvents.length}
              itemsPerPage={PAST_EVENTS_PER_PAGE}
              onPageChange={setPastEventsPage}
            />
          )}
        </div>
      )}

      {/* Message aucun résultat global */}
      {activeEvents.length === 0 && pastEvents.length === 0 && (
        <EventsList
          events={[]}
          onEdit={handleEditEvent}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicateEvent}
          onClick={handleEventClick}
        />
      )}
        </>
      )}

      {/* Choice modal */}
      {isChoiceOpen && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[var(--z-overlay)] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsChoiceOpen(false)}
          />
          <div className="fixed inset-x-4 top-[25%] z-[var(--z-overlay)] max-w-md mx-auto rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-backend animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold">Créer un événement</h3>
              <IconButton
                icon={<X size={15} />}
                ariaLabel="Fermer"
                variant="ghost"
                size="sm"
                onClick={() => setIsChoiceOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              />
            </div>
            <div className="p-3 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateEmpty}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left border border-border-custom justify-start h-auto"
              >
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={15} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Créer un event vide</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Tu remplis les infos toi-même depuis la page</p>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenShotgunSearch}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left border border-border-custom justify-start h-auto"
              >
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket size={15} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Importer depuis Shotgun</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Pré-rempli automatiquement depuis un event Shotgun existant</p>
                </div>
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Shotgun Search Modal */}
      <ShotgunSearchModal
        isOpen={isShotgunOpen}
        onClose={() => setIsShotgunOpen(false)}
        onSelect={handleShotgunSelect}
      />

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Supprimer l'événement"
        size="sm"
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          Êtes-vous sûr de vouloir supprimer l'événement{' '}
          <strong className="text-zinc-900 dark:text-zinc-100">&quot;{eventToDelete?.name}&quot;</strong> ? Cette action est irréversible.
        </p>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setEventToDelete(null)}>
            Annuler
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de formulaire (edition uniquement) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="border border-zinc-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col bg-card-bg">
            <div className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelForm}
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <EventForm
                event={editingEvent}
                onSubmit={handleSubmitForm}
                onCancel={handleCancelForm}
                existingArtists={existingArtists}
              />
            </div>
          </div>
        </div>
      )}

    </PageContentLayout>
  );
};
