/**
 * Artist Service - Interface abstraction (comme PlanningService)
 * Utilise Supabase pour le module Events
 */

import { Artist, ArtistType } from '@/types/event';
import {
  getArtistsList,
  createArtist as supabaseCreateArtist,
  updateArtist as supabaseUpdateArtist,
  addArtistToEvent as supabaseAddArtistToEvent,
  removeArtistFromEvent as supabaseRemoveArtistFromEvent,
  updateEventArtistAssignment as supabaseUpdateEventArtistAssignment,
} from '@/lib/supabase/events';

export interface IArtistService {
  getAll(): Promise<Artist[]>;
  getById(id: string): Promise<Artist | undefined>;
  create(input: { name: string; genre?: string; type?: ArtistType }): Promise<Artist>;
  update(id: string, updates: Partial<Pick<Artist, 'name' | 'genre' | 'type'>>): Promise<Artist>;
  delete(id: string): Promise<void>;
}

export interface IEventArtistService {
  getByEventId(eventId: string): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date } | undefined>;
  addArtistToEvent(eventId: string, artistId: string): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }>;
  removeArtistFromEvent(eventId: string, artistId: string): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }>;
  updateAssignment(
    eventId: string,
    artistId: string,
    updates: Partial<{ performanceTime?: string; fee?: number }>
  ): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }>;
  setOrder(eventId: string, artistIds: string[]): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }>;
}

const stubEventArtists = (eventId: string) => ({
  eventId,
  assignments: [] as unknown[],
  updatedAt: new Date(),
});

class SupabaseArtistService implements IArtistService {
  async getAll(): Promise<Artist[]> {
    return getArtistsList();
  }

  async getById(id: string): Promise<Artist | undefined> {
    const all = await getArtistsList();
    return all.find((a) => a.id === id);
  }

  async create(input: { name: string; genre?: string; type?: ArtistType }): Promise<Artist> {
    return supabaseCreateArtist(input);
  }

  async update(id: string, updates: Partial<Pick<Artist, 'name' | 'genre' | 'type'>>): Promise<Artist> {
    return supabaseUpdateArtist(id, updates);
  }

  async delete(id: string): Promise<void> {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('artists').delete().eq('id', id);
    if (error) throw error;
  }
}

class SupabaseEventArtistService implements IEventArtistService {
  async getByEventId(eventId: string): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date } | undefined> {
    return stubEventArtists(eventId);
  }

  async addArtistToEvent(eventId: string, artistId: string): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }> {
    await supabaseAddArtistToEvent(eventId, artistId);
    return stubEventArtists(eventId);
  }

  async removeArtistFromEvent(eventId: string, artistId: string): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }> {
    await supabaseRemoveArtistFromEvent(eventId, artistId);
    return stubEventArtists(eventId);
  }

  async updateAssignment(
    eventId: string,
    artistId: string,
    updates: Partial<{ performanceTime?: string; fee?: number }>
  ): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }> {
    await supabaseUpdateEventArtistAssignment(eventId, artistId, updates);
    return stubEventArtists(eventId);
  }

  async setOrder(_eventId: string, _artistIds: string[]): Promise<{ eventId: string; assignments: unknown[]; updatedAt: Date }> {
    return stubEventArtists(_eventId);
  }
}

export const artistService: IArtistService = new SupabaseArtistService();
export const eventArtistService: IEventArtistService = new SupabaseEventArtistService();
