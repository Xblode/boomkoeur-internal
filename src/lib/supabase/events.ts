/**
 * Service Events - Supabase
 * Remplace lib/localStorage/events.ts pour le module Events
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import type {
  Event,
  Artist,
  Comment,
  ComWorkflow,
  EventMedia,
  LinkedElement,
} from '@/types/event';

// --- Types DB (snake_case) ---
interface DbEvent {
  id: string;
  org_id?: string;
  name: string;
  date: string;
  end_time: string | null;
  location: string;
  brief: string | null;
  description: string;
  status: string;
  priority: string | null;
  tags: unknown;
  linked_elements: unknown;
  assignees: unknown;
  media: unknown;
  com_workflow: unknown;
  shotgun_event_id: number | null;
  shotgun_event_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface DbComment {
  id: string;
  event_id: string;
  author: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

interface DbArtist {
  id: string;
  name: string;
  genre: string;
  type: string | null;
}

interface DbEventArtist {
  event_id: string;
  artist_id: string;
  performance_time: string | null;
  fee: number | null;
}

// --- Mappers ---
function mapDbEventToEvent(
  row: DbEvent,
  comments: Comment[],
  artists: Artist[]
): Event {
  return {
    id: row.id,
    orgId: row.org_id ?? undefined,
    name: row.name,
    date: new Date(row.date),
    endTime: row.end_time ?? undefined,
    location: row.location ?? '',
    brief: (row.brief as string) ?? undefined,
    description: row.description ?? '',
    status: row.status as Event['status'],
    priority: (row.priority as Event['priority']) ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    linkedElements: Array.isArray(row.linked_elements) ? (row.linked_elements as LinkedElement[]) : [],
    assignees: Array.isArray(row.assignees) ? row.assignees : [],
    media: (row.media as EventMedia) ?? undefined,
    comWorkflow: (row.com_workflow as ComWorkflow) ?? undefined,
    shotgunEventId: row.shotgun_event_id ?? undefined,
    shotgunEventUrl: row.shotgun_event_url ?? undefined,
    artists,
    comments,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapDbCommentToComment(row: DbComment): Comment {
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    createdAt: new Date(row.created_at),
  };
}

function mapDbArtistToArtist(row: DbArtist, assignment?: DbEventArtist): Artist {
  return {
    id: row.id,
    name: row.name,
    genre: row.genre ?? '',
    type: (row.type as Artist['type']) ?? 'dj',
    performanceTime: assignment?.performance_time ?? undefined,
    fee: assignment?.fee ?? undefined,
  };
}

// --- API ---

/**
 * Récupère les événements de l'organisation.
 * @param orgId - ID de l'organisation (obligatoire pour éviter les fuites cross-org)
 * @returns [] si orgId est null/undefined
 */
export async function getEvents(orgId?: string | null): Promise<Event[]> {
  const resolvedOrgId = orgId ?? getActiveOrgId();
  if (!resolvedOrgId) return [];
  let query = supabase.from('events').select('*');
  query = query.eq('org_id', resolvedOrgId);
  const { data: eventsData, error: eventsError } = await query.order('date', { ascending: true });

  if (eventsError) throw eventsError;
  if (!eventsData?.length) return [];

  const eventIds = eventsData.map((e) => e.id);

  const [commentsRes, eventArtistsRes] = await Promise.all([
    supabase.from('event_comments').select('*').in('event_id', eventIds),
    supabase
      .from('event_artists')
      .select('*')
      .in('event_id', eventIds),
  ]);

  const artistIds = new Set<string>();
  (eventArtistsRes.data ?? []).forEach((ea: DbEventArtist) => artistIds.add(ea.artist_id));

  let artistsMap: Record<string, DbArtist> = {};
  if (artistIds.size > 0) {
    const { data: artistsData } = await supabase
      .from('artists')
      .select('*')
      .in('id', Array.from(artistIds));
    artistsMap = (artistsData ?? []).reduce((acc, a: DbArtist) => {
      acc[a.id] = a;
      return acc;
    }, {} as Record<string, DbArtist>);
  }

  const commentsByEvent: Record<string, Comment[]> = {};
  (commentsRes.data ?? []).forEach((c: DbComment) => {
    if (!commentsByEvent[c.event_id]) commentsByEvent[c.event_id] = [];
    commentsByEvent[c.event_id].push(mapDbCommentToComment(c));
  });

  const eventArtistsByEvent: Record<string, DbEventArtist[]> = {};
  (eventArtistsRes.data ?? []).forEach((ea: DbEventArtist) => {
    if (!eventArtistsByEvent[ea.event_id]) eventArtistsByEvent[ea.event_id] = [];
    eventArtistsByEvent[ea.event_id].push(ea);
  });

  return eventsData.map((row: DbEvent) => {
    const comments = commentsByEvent[row.id] ?? [];
    const assignments = eventArtistsByEvent[row.id] ?? [];
    const artists: Artist[] = assignments
      .map((ea) => {
        const artist = artistsMap[ea.artist_id];
        return artist ? mapDbArtistToArtist(artist, ea) : null;
      })
      .filter((a): a is Artist => a !== null);
    return mapDbEventToEvent(row, comments, artists);
  });
}

export async function getEventById(id: string): Promise<Event | null> {
  return getEventWithMergedArtists(id);
}

export async function getEventWithMergedArtists(id: string): Promise<Event | null> {
  const { data: eventRow, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !eventRow) return null;

  const [commentsRes, eventArtistsRes] = await Promise.all([
    supabase.from('event_comments').select('*').eq('event_id', id).order('created_at', { ascending: true }),
    supabase.from('event_artists').select('*').eq('event_id', id),
  ]);

  const artistIds = (eventArtistsRes.data ?? []).map((ea: DbEventArtist) => ea.artist_id);
  let artistsMap: Record<string, DbArtist> = {};
  const assignmentsMap: Record<string, DbEventArtist> = {};
  if (artistIds.length > 0) {
    const { data: artistsData } = await supabase.from('artists').select('*').in('id', artistIds);
    (artistsData ?? []).forEach((a: DbArtist) => {
      artistsMap[a.id] = a;
    });
    (eventArtistsRes.data ?? []).forEach((ea: DbEventArtist) => {
      assignmentsMap[ea.artist_id] = ea;
    });
  }

  const comments = (commentsRes.data ?? []).map((c: DbComment) => mapDbCommentToComment(c));
  const artists: Artist[] = artistIds
    .map((aid) => {
      const artist = artistsMap[aid];
      const assignment = assignmentsMap[aid];
      return artist ? mapDbArtistToArtist(artist, assignment) : null;
    })
    .filter((a): a is Artist => a !== null);

  return mapDbEventToEvent(eventRow as DbEvent, comments, artists);
}

function eventToDbPayload(event: Partial<Event>): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: event.name,
    date: event.date instanceof Date ? event.date.toISOString() : event.date,
    end_time: event.endTime ?? null,
    location: event.location ?? '',
    description: event.description ?? '',
    status: event.status,
    priority: event.priority ?? null,
    tags: event.tags ?? [],
    linked_elements: event.linkedElements ?? [],
    assignees: event.assignees ?? [],
    media: event.media ?? {},
    com_workflow: event.comWorkflow ?? {},
    shotgun_event_id: event.shotgunEventId ?? null,
    shotgun_event_url: event.shotgunEventUrl ?? null,
    updated_at: new Date().toISOString(),
  };
  // brief : n'inclure que si fourni (colonne optionnelle, absente si migration non appliquée)
  if (event.brief !== undefined) payload.brief = event.brief ?? '';
  return payload;
}

/** Payload partiel pour mises à jour (n'envoie que les champs fournis) */
function buildPartialEventPayload(updates: Partial<Event>): Record<string, unknown> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.date !== undefined) payload.date = updates.date instanceof Date ? updates.date.toISOString() : updates.date;
  if (updates.endTime !== undefined) payload.end_time = updates.endTime ?? null;
  if (updates.location !== undefined) payload.location = updates.location ?? '';
  if (updates.brief !== undefined) payload.brief = updates.brief ?? '';
  if (updates.description !== undefined) payload.description = updates.description ?? '';
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.priority !== undefined) payload.priority = updates.priority ?? null;
  if (updates.tags !== undefined) payload.tags = updates.tags ?? [];
  if (updates.linkedElements !== undefined) payload.linked_elements = updates.linkedElements ?? [];
  if (updates.assignees !== undefined) payload.assignees = updates.assignees ?? [];
  if (updates.media !== undefined) payload.media = updates.media ?? {};
  if (updates.comWorkflow !== undefined) payload.com_workflow = updates.comWorkflow ?? {};
  if (updates.shotgunEventId !== undefined) payload.shotgun_event_id = updates.shotgunEventId ?? null;
  if (updates.shotgunEventUrl !== undefined) payload.shotgun_event_url = updates.shotgunEventUrl ?? null;
  return payload;
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  const payload = buildPartialEventPayload(updates);
  if (Object.keys(payload).length <= 1) {
    const current = await getEventWithMergedArtists(id);
    if (!current) throw new Error('Event not found');
    return current;
  }

  const { error } = await supabase.from('events').update(payload).eq('id', id);
  if (error) throw error;

  const saved = await getEventWithMergedArtists(id);
  if (!saved) throw new Error('Event not found after update');
  return saved;
}

export async function saveEvent(
  event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> | Event
): Promise<Event> {
  const now = new Date();
  const isUpdate = 'id' in event && event.id;

  if (isUpdate) {
    const { data, error } = await supabase
      .from('events')
      .update(eventToDbPayload(event))
      .eq('id', event.id)
      .select()
      .single();

    if (error) throw error;

    if (event.artists && event.artists.length > 0) {
      await syncEventArtists(event.id, event.artists);
    } else {
      await supabase.from('event_artists').delete().eq('event_id', event.id);
    }

    const saved = await getEventWithMergedArtists(event.id);
    if (!saved) throw new Error('Event not found after save');
    return saved;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const createdBy = user?.id ?? null;

  const { data: inserted, error } = await supabase
    .from('events')
    .insert({
      ...eventToDbPayload(event),
      created_by: createdBy,
      org_id: getActiveOrgId(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  const newId = (inserted as DbEvent).id;

  if (event.artists && event.artists.length > 0) {
    await syncEventArtists(newId, event.artists);
  }

  const saved = await getEventWithMergedArtists(newId);
  if (!saved) throw new Error('Event not found after insert');
  return saved;
}

async function syncEventArtists(eventId: string, artists: Artist[]): Promise<void> {
  await supabase.from('event_artists').delete().eq('event_id', eventId);

  for (const a of artists) {
    const artistId = await ensureArtistExists(a);
    await supabase.from('event_artists').insert({
      event_id: eventId,
      artist_id: artistId,
      performance_time: a.performanceTime ?? null,
      fee: a.fee ?? null,
    });
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function ensureArtistExists(artist: Artist): Promise<string> {
  const isValidUuid = UUID_REGEX.test(artist.id);

  if (isValidUuid) {
    const { data: existing } = await supabase
      .from('artists')
      .select('id')
      .eq('id', artist.id)
      .single();

    if (existing) return artist.id;
  }

  const insertPayload: Record<string, unknown> = {
    name: artist.name,
    genre: artist.genre ?? '',
    type: artist.type ?? 'dj',
  };
  if (isValidUuid) insertPayload.id = artist.id;

  const { data: inserted, error } = await supabase
    .from('artists')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error) throw error;
  return (inserted as { id: string }).id;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateEvent(id: string): Promise<Event> {
  const source = await getEventWithMergedArtists(id);
  if (!source) throw new Error('Événement non trouvé');

  const duplicated = {
    name: `${source.name} (copie)`,
    date: source.date,
    location: source.location,
    brief: source.brief ?? '',
    description: source.description,
    status: 'idea' as const,
    artists: source.artists,
    linkedElements: [],
    tags: source.tags ?? [],
    comments: [],
  };

  return saveEvent(duplicated);
}

export async function addComment(eventId: string, content: string): Promise<Event> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Vous devez être connecté pour ajouter un commentaire');

  const meta = user.user_metadata as { nom?: string; prenom?: string } | undefined;
  const nom = meta?.nom ?? '';
  const prenom = meta?.prenom ?? '';
  const author = [prenom, nom].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'Utilisateur';

  const { error } = await supabase.from('event_comments').insert({
    event_id: eventId,
    author,
    user_id: user.id,
    content,
    org_id: getActiveOrgId(),
  });

  if (error) throw error;

  const updated = await getEventWithMergedArtists(eventId);
  if (!updated) throw new Error('Event not found after adding comment');
  return updated;
}

export async function getArtistsList(): Promise<Artist[]> {
  const { data, error } = await supabase.from('artists').select('*').order('name');

  if (error) throw error;
  return (data ?? []).map((row: DbArtist) => mapDbArtistToArtist(row));
}

// --- Artist CRUD (for EventArtistsSection) ---

export async function createArtist(input: {
  name: string;
  genre?: string;
  type?: Artist['type'];
}): Promise<Artist> {
  const { data, error } = await supabase
    .from('artists')
    .insert({
      name: input.name.trim(),
      genre: input.genre?.trim() ?? '',
      type: input.type ?? 'dj',
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbArtistToArtist(data as DbArtist);
}

export async function updateArtist(
  id: string,
  updates: Partial<Pick<Artist, 'name' | 'genre' | 'type'>>
): Promise<Artist> {
  const { data, error } = await supabase
    .from('artists')
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.genre !== undefined && { genre: updates.genre }),
      ...(updates.type !== undefined && { type: updates.type }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbArtistToArtist(data as DbArtist);
}

export async function addArtistToEvent(eventId: string, artistId: string): Promise<void> {
  const { error } = await supabase.from('event_artists').insert({
    event_id: eventId,
    artist_id: artistId,
  });
  if (error) throw error;
}

export async function removeArtistFromEvent(eventId: string, artistId: string): Promise<void> {
  const { error } = await supabase
    .from('event_artists')
    .delete()
    .eq('event_id', eventId)
    .eq('artist_id', artistId);
  if (error) throw error;
}

export async function addLinkedElementToEvent(
  eventId: string,
  element: LinkedElement
): Promise<Event> {
  const event = await getEventWithMergedArtists(eventId);
  if (!event) throw new Error('Événement non trouvé');
  const existing = event.linkedElements ?? [];
  if (existing.some((e) => e.id === element.id)) return event;
  const updated = {
    ...event,
    linkedElements: [...existing, element],
  };
  return saveEvent(updated);
}

export async function updateEventArtistAssignment(
  eventId: string,
  artistId: string,
  updates: Partial<{ performanceTime?: string; fee?: number }>
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.performanceTime !== undefined) payload.performance_time = updates.performanceTime;
  if (updates.fee !== undefined) payload.fee = updates.fee;
  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase
    .from('event_artists')
    .update(payload)
    .eq('event_id', eventId)
    .eq('artist_id', artistId);
  if (error) throw error;
}
