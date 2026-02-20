/**
 * Artist Service - Interface abstraction (comme PlanningService)
 */

import { Artist, ArtistType } from '@/types/event';
import * as artistsStorage from '@/lib/localStorage/artists';
import * as eventArtistsStorage from '@/lib/localStorage/eventArtists';

export interface IArtistService {
  getAll(): Promise<Artist[]>;
  getById(id: string): Promise<Artist | undefined>;
  create(input: { name: string; genre?: string; type?: ArtistType }): Promise<Artist>;
  update(id: string, updates: Partial<Pick<Artist, 'name' | 'genre' | 'type'>>): Promise<Artist>;
  delete(id: string): Promise<void>;
}

export interface IEventArtistService {
  getByEventId(eventId: string): Promise<eventArtistsStorage.EventArtists | undefined>;
  addArtistToEvent(eventId: string, artistId: string): Promise<eventArtistsStorage.EventArtists>;
  removeArtistFromEvent(eventId: string, artistId: string): Promise<eventArtistsStorage.EventArtists>;
  updateAssignment(
    eventId: string,
    artistId: string,
    updates: Partial<{ performanceTime: string; fee: number }>
  ): Promise<eventArtistsStorage.EventArtists>;
  setOrder(eventId: string, artistIds: string[]): Promise<eventArtistsStorage.EventArtists>;
}

class LocalStorageArtistService implements IArtistService {
  async getAll(): Promise<Artist[]> {
    return artistsStorage.getArtists();
  }

  async getById(id: string): Promise<Artist | undefined> {
    return artistsStorage.getArtistById(id);
  }

  async create(input: { name: string; genre?: string; type?: ArtistType }): Promise<Artist> {
    return artistsStorage.createArtist(input);
  }

  async update(id: string, updates: Partial<Pick<Artist, 'name' | 'genre' | 'type'>>): Promise<Artist> {
    return artistsStorage.updateArtist(id, updates);
  }

  async delete(id: string): Promise<void> {
    artistsStorage.deleteArtist(id);
  }
}

class LocalStorageEventArtistService implements IEventArtistService {
  async getByEventId(eventId: string): Promise<eventArtistsStorage.EventArtists | undefined> {
    return eventArtistsStorage.getEventArtistsByEventId(eventId);
  }

  async addArtistToEvent(eventId: string, artistId: string): Promise<eventArtistsStorage.EventArtists> {
    return eventArtistsStorage.addArtistToEvent(eventId, artistId);
  }

  async removeArtistFromEvent(eventId: string, artistId: string): Promise<eventArtistsStorage.EventArtists> {
    return eventArtistsStorage.removeArtistFromEvent(eventId, artistId);
  }

  async updateAssignment(
    eventId: string,
    artistId: string,
    updates: Partial<{ performanceTime: string; fee: number }>
  ): Promise<eventArtistsStorage.EventArtists> {
    return eventArtistsStorage.updateEventArtistAssignment(eventId, artistId, updates);
  }

  async setOrder(eventId: string, artistIds: string[]): Promise<eventArtistsStorage.EventArtists> {
    return eventArtistsStorage.setEventArtistsOrder(eventId, artistIds);
  }
}

export const artistService: IArtistService = new LocalStorageArtistService();
export const eventArtistService: IEventArtistService = new LocalStorageEventArtistService();
