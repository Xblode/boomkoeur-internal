'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Campaign, SocialPost, PublishedPost } from '@/types/communication';
import { CampaignTable, GlobalFeedPreview, CreateCampaignModal, ReviewPendingPosts } from './Dashboard';
import { Button } from '@/components/ui/atoms';
import {
  getCampaigns,
  getPublishedPosts,
  initializeStorage,
  saveCampaign,
  deleteCampaign as deleteStoredCampaign,
} from '@/lib/localStorage/communication';

/**
 * Vue principale du module Communication
 * Layout Split: Tableau des campagnes (gauche) + Feed Preview Smartphone (droite)
 */
export const CommunicationView: React.FC = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<PublishedPost[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    initializeStorage();
    setCampaigns(getCampaigns());
    setPublishedPosts(getPublishedPosts());
  }, []);

  // Récupérer tous les posts planifiés de toutes les campagnes
  const allScheduledPosts = campaigns.flatMap((campaign) =>
    campaign.posts.filter((post) => post.status !== 'published')
  );

  const handleViewCampaign = (campaign: Campaign) => {
    router.push(`/dashboard/communication/${campaign.id}`);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    // Si on veut éditer les métadonnées de la campagne, on pourrait ouvrir un modal ici
    // Pour l'instant on redirige aussi vers le détail
    router.push(`/dashboard/communication/${campaign.id}`);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    deleteStoredCampaign(campaignId);
    setCampaigns(getCampaigns());
  };

  const handleCreateCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCampaign = saveCampaign(campaignData);
    setCampaigns(getCampaigns());
    // Rediriger vers la nouvelle campagne
    router.push(`/dashboard/communication/${newCampaign.id}`);
  };

  const handlePostClick = (post: any) => {
    console.log('Post clicked:', post);
    // TODO: Afficher le détail du post
  };

  const handleReviewPostClick = (post: SocialPost, campaign: Campaign) => {
    // Rediriger vers la campagne avec le post sélectionné
    router.push(`/dashboard/communication/${campaign.id}`);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Global */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Communications</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gérez vos plans de communication
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} className="mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {/* Content Layout */}
      <div className="h-[calc(100vh-5rem)] flex gap-4 overflow-hidden min-h-0">
        {/* Partie gauche : Tableau des campagnes (Flexible) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <CampaignTable
            campaigns={campaigns}
            onViewCampaign={handleViewCampaign}
            onEditCampaign={handleEditCampaign}
            onDeleteCampaign={handleDeleteCampaign}
          />
        </div>

        {/* Partie droite : Feed Preview Smartphone (Fixe) */}
        <div className="w-[380px] flex-shrink-0 flex flex-col overflow-hidden min-w-0">
          <div className="h-full w-full">
            <GlobalFeedPreview
              publishedPosts={publishedPosts}
              scheduledPosts={allScheduledPosts}
              onPostClick={handlePostClick}
            />
          </div>
        </div>
      </div>

      {/* Posts en attente de révision */}
      <ReviewPendingPosts
        campaigns={campaigns}
        onPostClick={handleReviewPostClick}
      />

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCampaign}
      />
    </div>
  );
};
