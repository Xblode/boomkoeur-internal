/**
 * Utilitaires pour la gestion des événements dans localStorage
 */

import { Event, Artist } from '@/types/event';
import * as artistsStorage from './artists';
import * as eventArtistsStorage from './eventArtists';

const EVENTS_STORAGE_KEY = 'boomkoeur_events';

/**
 * Données mock pour démonstration
 */
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Soirée Techno Summer Kick-Off',
    date: new Date('2026-06-15T22:00:00'),
    location: 'Le Warehouse Club',
    description: 'Ouverture de la saison estivale avec les meilleurs DJs techno de la région',
    status: 'confirmed',
    artists: [
      {
        id: 'a1',
        name: 'DJ Marcus',
        genre: 'Techno',
        performanceTime: '22:00 - 00:00',
        fee: 800,
      },
      {
        id: 'a2',
        name: 'Luna Beats',
        genre: 'Tech House',
        performanceTime: '00:00 - 02:00',
        fee: 1000,
      },
    ],
    linkedElements: [],
    tags: ['Summer', 'Techno', 'Opening'],
    comments: [],
    comWorkflow: {
      activePhase: 'preparation',
      activeStep: 0,
      manual: {},
      shotgunUrl: '',
      overrides: {},
    },
    createdAt: new Date('2026-04-10T10:00:00'),
    updatedAt: new Date('2026-05-22T10:15:00'),
  },
  {
    id: '2',
    name: 'Electro Night - Festival des Lumières',
    date: new Date('2026-08-20T21:00:00'),
    location: 'Parc Municipal',
    description: 'Grande soirée électro en plein air avec installation lumineuse',
    status: 'preparation',
    artists: [
      {
        id: 'a3',
        name: 'Neon Pulse',
        genre: 'Electro House',
        performanceTime: '21:00 - 23:00',
        fee: 800, // Added fee to match type
      },
    ],
    linkedElements: [],
    tags: ['Electro', 'Outdoor', 'Light Show'],
    comments: [
      {
        id: 'c3',
        author: 'Marie',
        content: 'Il faut encore obtenir l\'autorisation de la mairie pour l\'événement en extérieur',
        createdAt: new Date('2026-05-15T16:45:00'),
      },
    ],
    createdAt: new Date('2026-04-25T15:00:00'),
    updatedAt: new Date('2026-05-15T16:45:00'),
  },
  {
    id: '3',
    name: 'House Music Marathon',
    date: new Date('2026-09-10T20:00:00'),
    location: 'Club Underground',
    description: '12 heures de house non-stop avec 8 artistes',
    status: 'idea',
    artists: [],
    linkedElements: [],
    tags: ['House', 'Marathon', 'Club'],
    comments: [],
    createdAt: new Date('2026-05-25T09:00:00'),
    updatedAt: new Date('2026-05-25T09:00:00'),
  },
  {
    id: '4',
    name: 'New Year Rave 2026',
    date: new Date('2025-12-31T23:00:00'),
    location: 'Le Warehouse Club',
    description: 'Réveillon électro avec 5 DJs et show pyrotechnique',
    status: 'completed',
    artists: [
      {
        id: 'a4',
        name: 'DJ Phoenix',
        genre: 'Progressive House',
        performanceTime: '23:00 - 01:00',
        fee: 1500,
      },
      {
        id: 'a5',
        name: 'Midnight Crew',
        genre: 'Trance',
        performanceTime: '01:00 - 03:00',
        fee: 1200,
      },
    ],
    linkedElements: [],
    tags: ['NYE', 'Rave', 'Fireworks'],
    comments: [
      {
        id: 'c4',
        author: 'Alex',
        content: 'Soirée incroyable ! Plus de 500 personnes, ambiance de folie',
        createdAt: new Date('2026-01-02T12:00:00'),
      },
    ],
    createdAt: new Date('2025-10-01T10:00:00'),
    updatedAt: new Date('2026-01-02T12:00:00'),
  },
  {
    id: '5',
    name: 'Festival Open Air - Communication Phase',
    date: new Date('2026-07-25T14:00:00'),
    location: 'Plage des Sables d\'Or',
    description: 'Festival en plein air sur la plage avec 3 scènes',
    status: 'preparation',
    artists: [
      {
        id: 'a6',
        name: 'Summer Vibes',
        genre: 'Deep House',
        performanceTime: '14:00 - 16:00',
      }
    ],
    linkedElements: [],
    tags: ['Open Air', 'Beach', 'Festival'],
    comments: [],
    comWorkflow: {
      activePhase: 'communication',
      activeStep: 0,
      manual: {
        firstPostPublished: true,
        linktreeUpdated: true,
        shotgunDone: true
      },
      shotgunUrl: 'https://shotgun.live/events/festival-open-air-2026',
      overrides: {
        visualsPrimaryReady: true,
        campaignStartDate: new Date('2026-06-01T10:00:00'),
        planComDone: true,
        editorialCalDone: true
      }
    },
    createdAt: new Date('2026-05-01T09:00:00'),
    updatedAt: new Date('2026-06-15T14:30:00'),
  }
];

/**
 * Initialise le localStorage avec les données mock si vide
 */
export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  const existingEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!existingEvents) {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(MOCK_EVENTS));
  }
};

/**
 * Récupère tous les événements depuis localStorage
 */
export const getEvents = (): Event[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!stored) {
      initializeStorage();
      return MOCK_EVENTS;
    }
    
    const events = JSON.parse(stored);
    // Convertir les dates string en objets Date
    return events.map((event: any) => ({
      ...event,
      tags: event.tags || [],
      date: new Date(event.date),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      comments: event.comments.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      })),
      comWorkflow: event.comWorkflow ? {
        ...event.comWorkflow,
        overrides: {
          ...event.comWorkflow.overrides,
          campaignStartDate: event.comWorkflow.overrides?.campaignStartDate 
            ? new Date(event.comWorkflow.overrides.campaignStartDate) 
            : undefined,
        }
      } : undefined,
    }));
  } catch (error) {
    console.error('Erreur lors de la lecture des événements:', error);
    return [];
  }
};

/**
 * Récupère la liste des artistes (pool global)
 */
export const getArtistsList = (): Artist[] => {
  return artistsStorage.getArtists();
};

/**
 * Sauvegarde ou met à jour un événement
 */
export const saveEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> | Event): Event => {
  if (typeof window === 'undefined') throw new Error('localStorage not available');
  
  const events = getEvents();
  const now = new Date();
  
  let savedEvent: Event;
  
  if ('id' in event && event.id) {
    // Mise à jour d'un événement existant
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      savedEvent = {
        ...event,
        updatedAt: now,
      };
      events[index] = savedEvent;
    } else {
      throw new Error('Événement non trouvé');
    }
  } else {
    // Création d'un nouvel événement
    savedEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    } as Event;
    events.push(savedEvent);
  }
  
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

  // Sync vers le nouveau système (pool global + eventArtists)
  if (savedEvent.artists && savedEvent.artists.length > 0) {
    const assignments: eventArtistsStorage.EventArtistAssignment[] = [];
    for (const a of savedEvent.artists) {
      artistsStorage.ensureArtistExists({
        id: a.id,
        name: a.name,
        genre: a.genre ?? '',
        type: a.type ?? 'dj',
      });
      assignments.push({
        artistId: a.id,
        performanceTime: a.performanceTime,
        fee: a.fee,
      });
    }
    eventArtistsStorage.saveEventArtists({
      eventId: savedEvent.id,
      assignments,
      updatedAt: new Date(),
    });
  }

  return savedEvent;
};

/**
 * Supprime un événement
 */
export const deleteEvent = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Récupère un événement par son ID
 */
export const getEventById = (id: string): Event | undefined => {
  const events = getEvents();
  return events.find(e => e.id === id);
};

/**
 * Récupère un événement avec artistes fusionnés (pool global + assignations par event).
 * Migre automatiquement les event.artists legacy vers le nouveau système.
 */
export const getEventWithMergedArtists = (id: string): Event | undefined => {
  const event = getEventById(id);
  if (!event) return undefined;

  let ea = eventArtistsStorage.getEventArtistsByEventId(id);
  const globalArtists = artistsStorage.getArtists();

  // Migration: si event a des artists (legacy) mais pas d'eventArtists
  if (!ea && event.artists && event.artists.length > 0) {
    const assignments: eventArtistsStorage.EventArtistAssignment[] = [];
    for (const a of event.artists) {
      artistsStorage.ensureArtistExists({
        id: a.id,
        name: a.name,
        genre: a.genre ?? '',
        type: a.type ?? 'dj',
      });
      assignments.push({
        artistId: a.id,
        performanceTime: a.performanceTime,
        fee: a.fee,
      });
    }
    eventArtistsStorage.saveEventArtists({
      eventId: id,
      assignments,
      updatedAt: new Date(),
    });
    ea = eventArtistsStorage.getEventArtistsByEventId(id);
  }
  if (ea && ea.assignments.length > 0) {
    const mergedArtists: Artist[] = ea.assignments.reduce<Artist[]>((acc, a) => {
      const artist = artistsStorage.getArtistById(a.artistId) ?? globalArtists.find((g) => g.id === a.artistId);
      if (!artist) return acc;
      acc.push({
        ...artist,
        performanceTime: a.performanceTime,
        fee: a.fee,
      });
      return acc;
    }, []);
    return { ...event, artists: mergedArtists };
  }

  return event;
};

/**
 * Ajoute un commentaire à un événement
 */
export const addComment = (eventId: string, author: string, content: string): Event => {
  const event = getEventById(eventId);
  if (!event) throw new Error('Événement non trouvé');
  
  const newComment = {
    id: Date.now().toString(),
    author,
    content,
    createdAt: new Date(),
  };
  
  event.comments.push(newComment);
  return saveEvent(event);
};

/**
 * Duplique un événement
 */
export const duplicateEvent = (id: string): Event => {
  const event = getEventById(id);
  if (!event) throw new Error('Événement non trouvé');
  
  const duplicated = {
    name: `${event.name} (copie)`,
    date: event.date,
    location: event.location,
    description: event.description,
    status: 'idea' as const,
    artists: event.artists,
    linkedElements: [],
    tags: event.tags || [],
    comments: [],
  };
  
  return saveEvent(duplicated);
};
