/**
 * Types unifiés pour le calendrier
 * Permet d'agréger des données venant de Events, Réunions, Rappels, Posts, etc.
 */

export type CalendarItemType = 'event' | 'meeting' | 'reminder' | 'post' | 'google_calendar' | string;

export interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  type: CalendarItemType;
  /** URL vers la page détail (ex: /dashboard/events/123) */
  href?: string;
  /** Données brutes pour usage avancé (ex: Event, Meeting) */
  source?: unknown;
}

export interface CalendarData {
  items: CalendarItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
