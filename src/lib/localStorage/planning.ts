/**
 * Gestion du planning par événement dans localStorage
 */

import { EventPlanning, ShiftAssignment, ShiftKey, PostId } from '@/types/planning';

const PLANNING_STORAGE_KEY = 'boomkoeur_plannings';

const emptyPlanning = (eventId: string): EventPlanning => ({
  eventId,
  volunteerIds: [],
  assignments: {} as Record<ShiftKey, ShiftAssignment>,
  updatedAt: new Date(),
});

function getAll(): EventPlanning[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PLANNING_STORAGE_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as any[]).map((p) => ({
      ...p,
      volunteerIds: p.volunteerIds ?? [],
      updatedAt: new Date(p.updatedAt),
    }));
  } catch {
    return [];
  }
}

function saveAll(plannings: EventPlanning[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(plannings));
}

export function getPlanningByEventId(eventId: string): EventPlanning | undefined {
  const found = getAll().find((p) => p.eventId === eventId);
  if (found && !found.volunteerIds) {
    found.volunteerIds = [];
  }
  return found;
}

export function savePlanning(planning: EventPlanning): EventPlanning {
  const all = getAll();
  const index = all.findIndex((p) => p.eventId === planning.eventId);
  const updated = { ...planning, updatedAt: new Date() };
  if (index !== -1) {
    all[index] = updated;
  } else {
    all.push(updated);
  }
  saveAll(all);
  return updated;
}

export function assignVolunteer(
  eventId: string,
  shiftKey: ShiftKey,
  postId: PostId,
  volunteerId: string
): EventPlanning {
  const planning: EventPlanning = getPlanningByEventId(eventId) ?? emptyPlanning(eventId);

  const assignments = planning.assignments as Record<string, ShiftAssignment>;

  if (!assignments[shiftKey]) {
    assignments[shiftKey] = {};
  }
  const shift: ShiftAssignment = assignments[shiftKey];
  if (!shift[postId]) {
    shift[postId] = [];
  }
  if (!shift[postId]!.includes(volunteerId)) {
    shift[postId]!.push(volunteerId);
  }

  return savePlanning({ ...planning, assignments: assignments as Record<ShiftKey, ShiftAssignment> });
}

export function unassignVolunteer(
  eventId: string,
  shiftKey: ShiftKey,
  postId: PostId,
  volunteerId: string
): EventPlanning {
  const planning = getPlanningByEventId(eventId);
  if (!planning) return emptyPlanning(eventId);

  const assignments = planning.assignments as Record<string, ShiftAssignment>;
  const shift = assignments[shiftKey];
  if (shift?.[postId]) {
    shift[postId] = shift[postId]!.filter((id) => id !== volunteerId);
  }

  return savePlanning(planning);
}

export function addVolunteerToPlanning(eventId: string, volunteerId: string): EventPlanning {
  const planning: EventPlanning = getPlanningByEventId(eventId) ?? emptyPlanning(eventId);
  if (!planning.volunteerIds.includes(volunteerId)) {
    planning.volunteerIds.push(volunteerId);
  }
  return savePlanning(planning);
}

export function removeVolunteerFromPlanning(eventId: string, volunteerId: string): EventPlanning {
  const planning = getPlanningByEventId(eventId);
  if (!planning) return emptyPlanning(eventId);

  planning.volunteerIds = planning.volunteerIds.filter((id) => id !== volunteerId);

  // Nettoyer toutes les affectations de ce bénévole
  const assignments = planning.assignments as Record<string, ShiftAssignment>;
  for (const shiftKey of Object.keys(assignments)) {
    const shift = assignments[shiftKey];
    for (const postId of Object.keys(shift) as PostId[]) {
      if (shift[postId]) {
        shift[postId] = shift[postId]!.filter((id) => id !== volunteerId);
      }
    }
  }

  return savePlanning(planning);
}

export function deletePlanningByEventId(eventId: string): void {
  const all = getAll().filter((p) => p.eventId !== eventId);
  saveAll(all);
}
