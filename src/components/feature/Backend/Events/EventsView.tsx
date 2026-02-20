"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/atoms';
import { Event, EventFilters as EventFiltersType, SortField, SortOrder } from '@/types/event';
import { ShotgunEvent } from '@/types/shotgun';
import { EventsList } from './EventsList';
import { EventFilters } from './EventFilters';
import { EventForm } from './EventForm';
import { ShotgunSearchModal } from './ShotgunSearchModal';
import {
  getEvents,
  saveEvent,
  deleteEvent,
  duplicateEvent,
  getArtistsList,
  initializeStorage,
} from '@/lib/localStorage/events';
import { Plus, History, X, Ticket, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';

export const EventsView: React.FC = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Initialiser et charger les événements
  useEffect(() => {
    initializeStorage();
    loadEvents();
  }, []);

  const loadEvents = () => {
    const loadedEvents = getEvents();
    setEvents(loadedEvents);
  };

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

  // Handlers
  const handleCreateEvent = () => {
    setIsChoiceOpen(true);
  };

  const handleCreateEmpty = () => {
    setIsChoiceOpen(false);
    const newEvent = saveEvent({
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
    loadEvents();
    router.push(`/dashboard/events/${newEvent.id}`);
  };

  const handleOpenShotgunSearch = () => {
    setIsChoiceOpen(false);
    setIsShotgunOpen(true);
  };

  const handleShotgunSelect = (sgEvent: ShotgunEvent) => {
    setIsShotgunOpen(false);

    const startDate = new Date(sgEvent.startTime);
    const endDate = new Date(sgEvent.endTime);
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    const newEvent = saveEvent({
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

    loadEvents();
    router.push(`/dashboard/events/${newEvent.id}`);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    loadEvents();
  };

  const handleDuplicateEvent = (id: string) => {
    duplicateEvent(id);
    loadEvents();
  };

  const handleSubmitForm = (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      saveEvent({ ...editingEvent, ...data });
    } else {
      saveEvent(data);
    }
    loadEvents();
    setIsFormOpen(false);
    setEditingEvent(undefined);
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

  const existingArtists = getArtistsList();

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground">
            Gérez vos événements et soirées musicales
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Filtres */}
      <EventFilters
        filters={filters}
        sortField={sortField}
        sortOrder={sortOrder}
        onFiltersChange={setFilters}
        onSortChange={handleSortChange}
        locations={locations}
        artists={artists}
      />

      {/* Compteur */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredAndSortedEvents.length} événement{filteredAndSortedEvents.length > 1 ? 's' : ''}{' '}
        {filteredAndSortedEvents.length !== events.length && `sur ${events.length}`}
      </div>

      {/* Liste des événements actifs */}
      {activeEvents.length > 0 && (
        <EventsList
          events={activeEvents}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onClick={handleEventClick}
        />
      )}

      {/* Liste des événements passés */}
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
              events={pastEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onDuplicate={handleDuplicateEvent}
              onClick={handleEventClick}
            />
          </div>
        </div>
      )}

      {/* Message aucun résultat global */}
      {activeEvents.length === 0 && pastEvents.length === 0 && (
        <EventsList
          events={[]}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onClick={handleEventClick}
        />
      )}

      {/* Choice modal */}
      {isChoiceOpen && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsChoiceOpen(false)}
          />
          <div className="fixed inset-x-4 top-[25%] z-[60] max-w-md mx-auto rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#171717] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold">Créer un événement</h3>
              <button
                onClick={() => setIsChoiceOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <button
                onClick={handleCreateEmpty}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left border border-border-custom"
              >
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={15} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Créer un event vide</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Tu remplis les infos toi-même depuis la page</p>
                </div>
              </button>
              <button
                onClick={handleOpenShotgunSearch}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left border border-border-custom"
              >
                <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket size={15} className="text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Importer depuis Shotgun</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Pré-rempli automatiquement depuis un event Shotgun existant</p>
                </div>
              </button>
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

      {/* Modal de formulaire (edition uniquement) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="border border-zinc-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#18181a' }}>
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

    </div>
  );
};
