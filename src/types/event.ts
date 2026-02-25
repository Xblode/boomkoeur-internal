/**
 * Types pour la gestion des événements
 */

export type EventStatus = 'idea' | 'preparation' | 'confirmed' | 'completed' | 'archived';
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ArtistType = 'dj' | 'photographe' | 'lightjockey';

export interface Artist {
  id: string;
  name: string;
  genre: string;
  type?: ArtistType;
  performanceTime?: string;
  fee?: number;
}

export interface LinkedElement {
  id: string;
  type: 'campaign' | 'transaction' | 'budget';
  label: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface EventMedia {
  posterA4?: string; // URL ou nom du fichier
  posterInsta?: string; // 1080x1440
  posterShotgun?: string; // 1920x1080
}

export type PostNetwork = 'instagram' | 'facebook' | 'tiktok';
export type PostType = 'post' | 'reel' | 'story' | 'newsletter';

export interface PostVisual {
  id: string;
  url: string;
  mediaType: 'image' | 'video';
  createdAt: string;
}

export interface ComWorkflowPost {
  id: string;
  name: string;
  description: string;
  networks: PostNetwork[];
  type?: PostType;
  scheduledDate?: string;
  bio?: string;
  visuals?: PostVisual[];
  verified?: boolean;
  published?: boolean;
  createdAt: string;
}

export interface ComWorkflow {
  activePhase: 'preparation' | 'production' | 'communication' | 'postEvent';
  activeStep: number;
  manual: {
    firstPostPublished?: boolean;
    linktreeUpdated?: boolean;
    facebookEventCreated?: boolean;
    shotgunDone?: boolean;
    textesReady?: boolean;
    eventDayPassed?: boolean;
    photosPublished?: boolean;
    statsAnalyzed?: boolean;
    securityContacted?: boolean;
  };
  shotgunUrl?: string;
  posts?: ComWorkflowPost[];
  overrides: {
    campaignStartDate?: Date | null;
    planComDone?: boolean;
    editorialCalDone?: boolean;
    postsReady?: boolean;
    visualsPrimaryReady?: boolean;
  };
}

export interface Event {
  id: string;
  orgId?: string;
  name: string;
  date: Date;
  endTime?: string;
  location: string;
  /** Brief de campagne (étape 1 communication) */
  brief?: string;
  /** Bio / description publique de l'événement */
  description: string;
  status: EventStatus;
  artists: Artist[];
  linkedElements: LinkedElement[];
  tags: string[];
  priority?: EventPriority;
  assignees?: string[];
  comments: Comment[];
  media?: EventMedia;
  comWorkflow?: ComWorkflow;
  shotgunEventId?: number;
  shotgunEventUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFilters {
  search: string;
  status: EventStatus | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  location: string;
  artist: string;
}

export type SortField = 'date' | 'name' | 'status';
export type SortOrder = 'asc' | 'desc';
