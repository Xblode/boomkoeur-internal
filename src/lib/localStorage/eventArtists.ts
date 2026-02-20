/**
 * Gestion des assignations artistes par événement (comme planning bénévoles)
 */

export interface EventArtistAssignment {
  artistId: string;
  performanceTime?: string;
  fee?: number;
}

export interface EventArtists {
  eventId: string;
  assignments: EventArtistAssignment[];
  updatedAt: Date;
}

const EVENT_ARTISTS_STORAGE_KEY = 'boomkoeur_event_artists';

function getAll(): EventArtists[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(EVENT_ARTISTS_STORAGE_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as any[]).map((e) => ({
      ...e,
      updatedAt: new Date(e.updatedAt),
    }));
  } catch {
    return [];
  }
}

function saveAll(data: EventArtists[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EVENT_ARTISTS_STORAGE_KEY, JSON.stringify(data));
}

export function getEventArtistsByEventId(eventId: string): EventArtists | undefined {
  const found = getAll().find((e) => e.eventId === eventId);
  return found;
}

export function saveEventArtists(eventArtists: EventArtists): EventArtists {
  const all = getAll();
  const index = all.findIndex((e) => e.eventId === eventArtists.eventId);
  const updated = { ...eventArtists, updatedAt: new Date() };
  if (index !== -1) {
    all[index] = updated;
  } else {
    all.push(updated);
  }
  saveAll(all);
  return updated;
}

export function addArtistToEvent(eventId: string, artistId: string): EventArtists {
  const current = getEventArtistsByEventId(eventId) ?? {
    eventId,
    assignments: [],
    updatedAt: new Date(),
  };
  if (current.assignments.some((a) => a.artistId === artistId)) {
    return current;
  }
  current.assignments.push({ artistId });
  return saveEventArtists(current);
}

export function removeArtistFromEvent(eventId: string, artistId: string): EventArtists {
  const current = getEventArtistsByEventId(eventId);
  if (!current) {
    return saveEventArtists({ eventId, assignments: [], updatedAt: new Date() });
  }
  current.assignments = current.assignments.filter((a) => a.artistId !== artistId);
  return saveEventArtists(current);
}

export function updateEventArtistAssignment(
  eventId: string,
  artistId: string,
  updates: Partial<Pick<EventArtistAssignment, 'performanceTime' | 'fee'>>
): EventArtists {
  const current = getEventArtistsByEventId(eventId) ?? {
    eventId,
    assignments: [],
    updatedAt: new Date(),
  };
  const idx = current.assignments.findIndex((a) => a.artistId === artistId);
  if (idx === -1) return current;
  current.assignments[idx] = { ...current.assignments[idx], ...updates };
  return saveEventArtists(current);
}

export function setEventArtistsOrder(eventId: string, artistIds: string[]): EventArtists {
  const current = getEventArtistsByEventId(eventId) ?? {
    eventId,
    assignments: [],
    updatedAt: new Date(),
  };
  const byId = new Map(current.assignments.map((a) => [a.artistId, a]));
  const newAssignments = artistIds
    .map((id) => byId.get(id))
    .filter(Boolean) as EventArtistAssignment[];
  current.assignments = newAssignments;
  return saveEventArtists(current);
}
