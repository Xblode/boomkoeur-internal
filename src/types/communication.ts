/**
 * Types pour le module Communication & Réseaux Sociaux
 */

// Plateformes sociales supportées
export type SocialPlatform = 
  | 'instagram' 
  | 'tiktok' 
  | 'facebook' 
  | 'youtube' 
  | 'newsletter' 
  | 'website' 
  | 'email';

// Types de posts Instagram
export type InstagramPostType = 'post' | 'carousel' | 'reel' | 'story';

// Statuts du workflow de création
export type PostStatus = 
  | 'brainstorming'  // Phase d'idéation
  | 'created'        // Contenu créé
  | 'review'         // En cours de revue
  | 'validated'      // Validé et prêt
  | 'scheduled'      // Planifié pour publication
  | 'published';     // Publié

// Type de campagne
export type CampaignType = 'event' | 'generic';

/**
 * Interactivité pour les Stories Instagram
 */
export interface StoryInteractive {
  type: 'poll' | 'question' | 'link' | 'countdown' | 'quiz';
  data: {
    question?: string;
    options?: string[];
    url?: string;
    endDate?: Date;
  };
}

/**
 * Musique pour les posts
 */
export interface PostMusic {
  title: string;
  artist: string;
  duration?: number;
  startTime?: number; // En secondes
}

/**
 * Contenu d'un slide de carrousel
 */
export interface CarouselSlide {
  id: string;
  image?: string;
  text: string;
  order: number;
}

/**
 * Données de Brainstorming d'un post
 */
export interface PostBrainstorming {
  objective: string;        // Objectif du post
  targetAudience?: string;  // Public cible
  format: InstagramPostType; // Format prévu
  estimatedDate?: Date;     // Date approximative
  brief: string;            // Mini brief / Notes
}

/**
 * Post Social Media
 */
export interface SocialPost {
  id: string;
  campaignId: string;
  platform: SocialPlatform;
  type: InstagramPostType;
  status: PostStatus;
  
  // Brainstorming
  brainstorming: PostBrainstorming;
  
  // Contenu
  media: string[];           // URLs des images/vidéos
  caption: string;           // Texte du post
  hashtags: string[];        // Liste des hashtags
  taggedUsers: string[];     // Utilisateurs tagués (@username)
  collaboration?: string;    // Collaboration avec
  location?: string;         // Lieu
  
  // Spécifique au type
  music?: PostMusic;                    // Pour Reel/Story
  carouselSlides?: CarouselSlide[];    // Pour Carrousel
  storyInteractive?: StoryInteractive; // Pour Story
  
  // Dates
  scheduledDate?: Date;      // Date de publication prévue
  publishedDate?: Date;      // Date de publication effective
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campagne de Communication
 */
export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  
  // Liens avec les événements
  eventIds: string[];        // Peut être lié à un ou plusieurs événements
  
  // Plateformes ciblées
  platforms: SocialPlatform[];
  
  // Dates
  startDate?: Date;
  endDate?: Date;
  
  // Contenu
  description: string;
  objectives?: string[];
  
  // Posts de la campagne
  posts: SocialPost[];
  
  // Métadonnées
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Filtres pour les campagnes
 */
export interface CampaignFilters {
  search: string;
  type: CampaignType | 'all';
  status: Campaign['status'] | 'all';
  platform?: SocialPlatform;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Post "Ancien" déjà publié (pour le feed preview)
 */
export interface PublishedPost {
  id: string;
  platform: SocialPlatform;
  type: InstagramPostType;
  media: string;             // Image principale
  caption?: string;
  publishedDate: Date;
  likes?: number;
  comments?: number;
  link?: string;             // Lien vers le post original
}
