// Types pour le module Réunions

// Statut simple
export type MeetingStatus = 'upcoming' | 'completed';

// Document attaché à un point de l'ordre du jour
export type AgendaDocument = {
  id: string;
  name: string;
  url: string;
};

// Point d'ordre du jour
export type AgendaItem = {
  id: string;
  order: number;
  title: string;
  description?: string; // Description du point de l'ordre du jour
  duration: number; // en minutes
  responsible?: string; // Nom du responsable
  documents: AgendaDocument[];
  requiresVote: boolean;
  voteResult?: 'approved' | 'rejected' | 'pending';
  notes?: string; // Notes spécifiques au point (pour compte-rendu structuré)
};

// Réunion complète
export type Meeting = {
  id: string;
  title: string;
  description?: string; // Description / contexte de la réunion
  date: Date;
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  location?: string;
  participants: string[]; // Noms des participants
  status: MeetingStatus;
  
  // Ordre du jour
  agenda: AgendaItem[];
  
  // Compte-rendu
  minutes: {
    freeText: string; // Notes libres (rich text ou markdown)
    createdAt?: Date;
    updatedAt?: Date;
  };
  
  // Métadonnées
  created_at: Date;
  updated_at: Date;
  calendar_event_id?: string; // Lien vers l'événement calendrier
};

// Filtres
export type MeetingFilters = {
  search: string;
  status: MeetingStatus | 'all';
  dateFrom?: Date;
  dateTo?: Date;
};

// Stats
export type MeetingStats = {
  total_meetings: number;
  upcoming_meetings: number;
  completed_meetings: number;
  meetings_this_month: number;
  average_duration: number; // en minutes
  next_meeting_date?: Date;
  minutes_completion_rate: number; // pourcentage
};

// Inputs pour création
export type MeetingInput = Omit<Meeting, 'id' | 'created_at' | 'updated_at'>;
export type AgendaItemInput = Omit<AgendaItem, 'id'>;
