/**
 * Types pour la gestion du planning bénévoles / membres
 */

export type VolunteerKind = 'benevole' | 'membre';

export interface Volunteer {
  id: string;
  name: string;
  kind: VolunteerKind;
  isFavorite?: boolean;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VolunteerInput = Pick<Volunteer, 'name' | 'kind'>;
export type VolunteerUpdate = Partial<Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>>;

export const PLANNING_POSTS = [
  'entree',
  'merch_rdr',
  'vestiaire',
  'safer',
  'dj',
  'photo',
  'pause',
] as const;

export type PostId = (typeof PLANNING_POSTS)[number];

export const POST_LABELS: Record<PostId, string> = {
  entree: 'Entrée',
  merch_rdr: 'Merch/RDR',
  vestiaire: 'Vestiaire',
  safer: 'Safer',
  dj: 'DJ',
  photo: 'Photo',
  pause: 'Pause',
};

/**
 * Clé d'un créneau horaire, au format "HH:mm" (heure de début du shift).
 * Ex: "19:30", "20:30", "21:30"
 */
export type ShiftKey = string;

/**
 * Affectation d'un créneau : pour chaque poste, la liste des IDs de bénévoles.
 */
export type ShiftAssignment = Partial<Record<PostId, string[]>>;

/**
 * Planning complet d'un événement.
 * `volunteerIds` : liste ordonnée des IDs de bénévoles ajoutés au planning (= les lignes du tableau).
 * `assignments` est indexé par ShiftKey (heure de début du shift).
 */
export interface EventPlanning {
  eventId: string;
  volunteerIds: string[];
  assignments: Record<ShiftKey, ShiftAssignment>;
  updatedAt: Date;
}
