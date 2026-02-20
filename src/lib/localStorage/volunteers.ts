/**
 * Gestion des bénévoles/membres dans localStorage (pool global)
 */

import { Volunteer, VolunteerInput, VolunteerUpdate } from '@/types/planning';

const VOLUNTEERS_STORAGE_KEY = 'boomkoeur_volunteers';

const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Alice Martin', kind: 'membre', createdAt: new Date('2026-01-10'), updatedAt: new Date('2026-01-10') },
  { id: 'v2', name: 'Bob Dupont', kind: 'benevole', createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-01-15') },
  { id: 'v3', name: 'Clara Petit', kind: 'benevole', createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-02-01') },
  { id: 'v4', name: 'David Moreau', kind: 'membre', createdAt: new Date('2026-02-05'), updatedAt: new Date('2026-02-05') },
  { id: 'v5', name: 'Emma Leroy', kind: 'benevole', createdAt: new Date('2026-02-10'), updatedAt: new Date('2026-02-10') },
];

function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(VOLUNTEERS_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(MOCK_VOLUNTEERS));
  }
}

function parseDates(raw: any): Volunteer {
  return { ...raw, createdAt: new Date(raw.createdAt), updatedAt: new Date(raw.updatedAt) };
}

export function getVolunteers(): Volunteer[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(VOLUNTEERS_STORAGE_KEY);
    if (!stored) {
      initializeStorage();
      return MOCK_VOLUNTEERS;
    }
    return (JSON.parse(stored) as any[]).map(parseDates);
  } catch {
    return [];
  }
}

export function getVolunteerById(id: string): Volunteer | undefined {
  return getVolunteers().find((v) => v.id === id);
}

export function createVolunteer(input: VolunteerInput): Volunteer {
  const volunteers = getVolunteers();
  const now = new Date();
  const volunteer: Volunteer = {
    id: `v-${Date.now()}`,
    name: input.name,
    kind: input.kind,
    createdAt: now,
    updatedAt: now,
  };
  volunteers.push(volunteer);
  localStorage.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(volunteers));
  return volunteer;
}

export function updateVolunteer(id: string, updates: VolunteerUpdate): Volunteer {
  const volunteers = getVolunteers();
  const index = volunteers.findIndex((v) => v.id === id);
  if (index === -1) throw new Error('Bénévole non trouvé');
  volunteers[index] = { ...volunteers[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(volunteers));
  return volunteers[index];
}

export function deleteVolunteer(id: string): void {
  const volunteers = getVolunteers().filter((v) => v.id !== id);
  localStorage.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(volunteers));
}

export function toggleVolunteerFavorite(id: string): Volunteer {
  const volunteers = getVolunteers();
  const index = volunteers.findIndex((v) => v.id === id);
  if (index === -1) throw new Error('Bénévole non trouvé');
  volunteers[index] = {
    ...volunteers[index],
    isFavorite: !volunteers[index].isFavorite,
    updatedAt: new Date(),
  };
  localStorage.setItem(VOLUNTEERS_STORAGE_KEY, JSON.stringify(volunteers));
  return volunteers[index];
}
