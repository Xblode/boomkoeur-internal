/**
 * Planning Service - Interface abstraction for future Supabase migration
 */

import {
  Volunteer,
  VolunteerInput,
  VolunteerUpdate,
  EventPlanning,
  ShiftKey,
  PostId,
} from '@/types/planning';

import * as volunteersStorage from '@/lib/localStorage/volunteers';
import * as planningStorage from '@/lib/localStorage/planning';

// ── Volunteer service interface ──

export interface IVolunteerService {
  getAll(): Promise<Volunteer[]>;
  getById(id: string): Promise<Volunteer | undefined>;
  create(input: VolunteerInput): Promise<Volunteer>;
  update(id: string, updates: VolunteerUpdate): Promise<Volunteer>;
  delete(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<Volunteer>;
}

// ── Event planning service interface ──

export interface IEventPlanningService {
  getByEventId(eventId: string): Promise<EventPlanning | undefined>;
  save(planning: EventPlanning): Promise<EventPlanning>;
  assign(eventId: string, shiftKey: ShiftKey, postId: PostId, volunteerId: string): Promise<EventPlanning>;
  unassign(eventId: string, shiftKey: ShiftKey, postId: PostId, volunteerId: string): Promise<EventPlanning>;
  addVolunteerToPlanning(eventId: string, volunteerId: string): Promise<EventPlanning>;
  removeVolunteerFromPlanning(eventId: string, volunteerId: string): Promise<EventPlanning>;
  deleteByEventId(eventId: string): Promise<void>;
}

// ── LocalStorage implementations ──

class LocalStorageVolunteerService implements IVolunteerService {
  async getAll(): Promise<Volunteer[]> {
    return volunteersStorage.getVolunteers();
  }

  async getById(id: string): Promise<Volunteer | undefined> {
    return volunteersStorage.getVolunteerById(id);
  }

  async create(input: VolunteerInput): Promise<Volunteer> {
    return volunteersStorage.createVolunteer(input);
  }

  async update(id: string, updates: VolunteerUpdate): Promise<Volunteer> {
    return volunteersStorage.updateVolunteer(id, updates);
  }

  async delete(id: string): Promise<void> {
    volunteersStorage.deleteVolunteer(id);
  }

  async toggleFavorite(id: string): Promise<Volunteer> {
    return volunteersStorage.toggleVolunteerFavorite(id);
  }
}

class LocalStorageEventPlanningService implements IEventPlanningService {
  async getByEventId(eventId: string): Promise<EventPlanning | undefined> {
    return planningStorage.getPlanningByEventId(eventId);
  }

  async save(planning: EventPlanning): Promise<EventPlanning> {
    return planningStorage.savePlanning(planning);
  }

  async assign(eventId: string, shiftKey: ShiftKey, postId: PostId, volunteerId: string): Promise<EventPlanning> {
    return planningStorage.assignVolunteer(eventId, shiftKey, postId, volunteerId);
  }

  async unassign(eventId: string, shiftKey: ShiftKey, postId: PostId, volunteerId: string): Promise<EventPlanning> {
    return planningStorage.unassignVolunteer(eventId, shiftKey, postId, volunteerId);
  }

  async addVolunteerToPlanning(eventId: string, volunteerId: string): Promise<EventPlanning> {
    return planningStorage.addVolunteerToPlanning(eventId, volunteerId);
  }

  async removeVolunteerFromPlanning(eventId: string, volunteerId: string): Promise<EventPlanning> {
    return planningStorage.removeVolunteerFromPlanning(eventId, volunteerId);
  }

  async deleteByEventId(eventId: string): Promise<void> {
    planningStorage.deletePlanningByEventId(eventId);
  }
}

// ── Singleton exports ──

export const volunteerService: IVolunteerService = new LocalStorageVolunteerService();
export const eventPlanningService: IEventPlanningService = new LocalStorageEventPlanningService();
