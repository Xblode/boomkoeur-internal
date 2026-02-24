/**
 * Utilitaires pour la gestion de la communication dans localStorage
 */

import { Campaign, SocialPost, PublishedPost } from '@/types/communication';
import { mockCampaigns, mockPublishedPosts } from '@/lib/mocks/communication';

const CAMPAIGNS_STORAGE_KEY = 'boomkoeur_campaigns';
const PUBLISHED_POSTS_STORAGE_KEY = 'boomkoeur_published_posts';

/**
 * Initialise le localStorage avec les données mock si vide (utilisé par Communication)
 */
export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;

  const existingCampaigns = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
  if (!existingCampaigns) {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(mockCampaigns));
  }

  const existingPublishedPosts = localStorage.getItem(PUBLISHED_POSTS_STORAGE_KEY);
  if (!existingPublishedPosts) {
    localStorage.setItem(PUBLISHED_POSTS_STORAGE_KEY, JSON.stringify(mockPublishedPosts));
  }
};

/**
 * Récupère toutes les campagnes depuis localStorage (sans initialiser avec des mocks)
 */
export const getCampaigns = (): Campaign[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const campaigns = JSON.parse(stored);
    // Convertir les dates string en objets Date
    return campaigns.map((campaign: any) => ({
      ...campaign,
      startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
      endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
      createdAt: new Date(campaign.createdAt),
      updatedAt: new Date(campaign.updatedAt),
      posts: campaign.posts.map((post: any) => ({
        ...post,
        scheduledDate: post.scheduledDate ? new Date(post.scheduledDate) : undefined,
        publishedDate: post.publishedDate ? new Date(post.publishedDate) : undefined,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
        brainstorming: post.brainstorming
          ? {
              ...post.brainstorming,
              estimatedDate: post.brainstorming.estimatedDate
                ? new Date(post.brainstorming.estimatedDate)
                : undefined,
            }
          : undefined,
      })),
    }));
  } catch (error) {
    console.error('Erreur lors de la lecture des campagnes:', error);
    return [];
  }
};

/**
 * Récupère tous les posts publiés depuis localStorage
 */
export const getPublishedPosts = (): PublishedPost[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PUBLISHED_POSTS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const posts = JSON.parse(stored);
    return posts.map((post: any) => ({
      ...post,
      publishedDate: new Date(post.publishedDate),
    }));
  } catch (error) {
    console.error('Erreur lors de la lecture des posts publiés:', error);
    return [];
  }
};

/**
 * Vide les campagnes et posts du localStorage (utilisé pour réinitialiser le calendrier)
 */
export const clearCampaigns = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CAMPAIGNS_STORAGE_KEY);
  localStorage.removeItem(PUBLISHED_POSTS_STORAGE_KEY);
};

// Génère un ID lisible : slug-code (ex: campagne-ete-x7k9p)
const generateCampaignId = (name: string): string => {
  const slug = name
    .toLowerCase()
    .normalize('NFD') // Décompose les accents
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace tout ce qui n'est pas alphanumérique par un tiret
    .replace(/^-+|-+$/g, ''); // Supprime les tirets au début et à la fin

  const randomCode = Math.random().toString(36).substring(2, 7); // 5 caractères aléatoires
  
  return `${slug}-${randomCode}`;
};

/**
 * Sauvegarde ou met à jour une campagne
 */
export const saveCampaign = (
  campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> | Campaign
): Campaign => {
  if (typeof window === 'undefined') throw new Error('localStorage not available');

  const campaigns = getCampaigns();
  const now = new Date();

  let savedCampaign: Campaign;

  if ('id' in campaign && campaign.id) {
    // Mise à jour d'une campagne existante
    const index = campaigns.findIndex((c) => c.id === campaign.id);
    if (index !== -1) {
      savedCampaign = {
        ...campaign,
        updatedAt: now,
      };
      campaigns[index] = savedCampaign;
    } else {
      throw new Error('Campagne non trouvée');
    }
  } else {
    // Création d'une nouvelle campagne
    savedCampaign = {
      ...campaign,
      id: generateCampaignId(campaign.name), // Génération de l'ID basé sur le nom
      createdAt: now,
      updatedAt: now,
    } as Campaign;
    campaigns.push(savedCampaign);
  }

  localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
  return savedCampaign;
};

/**
 * Supprime une campagne
 */
export const deleteCampaign = (id: string): void => {
  if (typeof window === 'undefined') return;

  const campaigns = getCampaigns();
  const filtered = campaigns.filter((c) => c.id !== id);
  localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Récupère une campagne par son ID
 */
export const getCampaignById = (id: string): Campaign | undefined => {
  const campaigns = getCampaigns();
  return campaigns.find((c) => c.id === id);
};

/**
 * Ajoute un post à une campagne
 */
export const addPostToCampaign = (
  campaignId: string,
  post: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>
): Campaign => {
  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error('Campagne non trouvée');

  const now = new Date();
  const newPost: SocialPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: now,
    updatedAt: now,
  };

  campaign.posts.push(newPost);
  return saveCampaign(campaign);
};

/**
 * Met à jour un post dans une campagne
 */
export const updatePost = (
  campaignId: string,
  postId: string,
  updates: Partial<SocialPost>
): Campaign => {
  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error('Campagne non trouvée');

  const postIndex = campaign.posts.findIndex((p) => p.id === postId);
  if (postIndex === -1) throw new Error('Post non trouvé');

  campaign.posts[postIndex] = {
    ...campaign.posts[postIndex],
    ...updates,
    updatedAt: new Date(),
  };

  return saveCampaign(campaign);
};

/**
 * Supprime un post d'une campagne
 */
export const deletePost = (campaignId: string, postId: string): Campaign => {
  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error('Campagne non trouvée');

  campaign.posts = campaign.posts.filter((p) => p.id !== postId);
  return saveCampaign(campaign);
};

/**
 * Ajoute un post publié à la liste
 */
export const addPublishedPost = (
  post: Omit<PublishedPost, 'id'>
): PublishedPost => {
  if (typeof window === 'undefined')
    throw new Error('localStorage not available');

  const publishedPosts = getPublishedPosts();
  const newPost: PublishedPost = {
    ...post,
    id: Date.now().toString(),
  };

  publishedPosts.unshift(newPost); // Ajouter au début
  localStorage.setItem(
    PUBLISHED_POSTS_STORAGE_KEY,
    JSON.stringify(publishedPosts)
  );

  return newPost;
};

/**
 * Supprime un post publié
 */
export const deletePublishedPost = (id: string): void => {
  if (typeof window === 'undefined') return;

  const posts = getPublishedPosts();
  const filtered = posts.filter((p) => p.id !== id);
  localStorage.setItem(PUBLISHED_POSTS_STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Marque un post comme publié (le déplace de la campagne vers les posts publiés)
 */
export const publishPost = (campaignId: string, postId: string): void => {
  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error('Campagne non trouvée');

  const post = campaign.posts.find((p) => p.id === postId);
  if (!post) throw new Error('Post non trouvé');

  // Créer le post publié
  const publishedPost: Omit<PublishedPost, 'id'> = {
    platform: post.platform,
    type: post.type,
    media: post.media[0] || '',
    caption: post.caption,
    publishedDate: new Date(),
    likes: 0,
    comments: 0,
  };

  addPublishedPost(publishedPost);

  // Mettre à jour le statut du post dans la campagne
  updatePost(campaignId, postId, {
    status: 'published',
    publishedDate: new Date(),
  });
};
