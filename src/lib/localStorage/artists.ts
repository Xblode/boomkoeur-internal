/**
 * @deprecated Les artistes sont gérés via Supabase (lib/supabase/events, ArtistService).
 * Ce fichier est conservé pour référence.
 */

import { Artist, ArtistType } from '@/types/event';

const ARTISTS_STORAGE_KEY = 'boomkoeur_artists_global';

function parseArtist(raw: any): Artist {
  return {
    ...raw,
    id: raw.id,
    name: raw.name,
    genre: raw.genre ?? '',
    type: raw.type ?? 'dj',
  };
}

export function getArtists(): Artist[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ARTISTS_STORAGE_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as any[]).map(parseArtist);
  } catch {
    return [];
  }
}

export function getArtistById(id: string): Artist | undefined {
  return getArtists().find((a) => a.id === id);
}

export function createArtist(input: { name: string; genre?: string; type?: ArtistType }): Artist {
  const artists = getArtists();
  const artist: Artist = {
    id: `artist-${Date.now()}`,
    name: input.name.trim(),
    genre: input.genre?.trim() ?? '',
    type: input.type ?? 'dj',
  };
  artists.push(artist);
  localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(artists));
  return artist;
}

export function updateArtist(id: string, updates: Partial<Pick<Artist, 'name' | 'genre' | 'type'>>): Artist {
  const artists = getArtists();
  const index = artists.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Artiste non trouvé');
  artists[index] = { ...artists[index], ...updates };
  localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(artists));
  return artists[index];
}

export function deleteArtist(id: string): void {
  const artists = getArtists().filter((a) => a.id !== id);
  localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(artists));
}

/** Ajoute un artiste au pool s'il n'existe pas déjà (migration) */
export function ensureArtistExists(artist: Artist): Artist {
  const existing = getArtistById(artist.id);
  if (existing) return existing;
  const artists = getArtists();
  artists.push(artist);
  localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(artists));
  return artist;
}
