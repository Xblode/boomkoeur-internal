'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Plus, Settings, LayoutGrid, LayoutList, CalendarRange } from 'lucide-react';
import { Campaign, SocialPost } from '@/types/communication';
import { Button, Badge, IconButton } from '@/components/ui/atoms';
import { getCampaignById, saveCampaign, deleteCampaign } from '@/lib/localStorage/communication';
import { PostCreationWizard } from '../PostWizard';
import { CampaignSidebar } from './CampaignSidebar';
import { PostDetailPanel } from './PostDetailPanel';
import { PostKanbanBoard } from './PostKanbanBoard';
import { CampaignSettingsModal } from './CampaignSettingsModal';

interface CampaignDetailViewProps {
  campaignId: string;
}

type ViewMode = 'list' | 'timeline' | 'kanban';

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({ campaignId }) => {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<SocialPost | undefined>(undefined);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | undefined>(undefined);

  useEffect(() => {
    const data = getCampaignById(campaignId);
    if (data) {
      setCampaign(data);
      // Sélectionner le premier post par défaut
      if (data.posts.length > 0 && !selectedPost) {
        setSelectedPost(data.posts[0]);
      }
    }
  }, [campaignId]);

  if (!campaign) {
    return <div className="p-8 text-center text-muted-foreground">Chargement de la campagne...</div>;
  }

  const handleCreatePost = () => {
    setEditingPost(undefined);
    setIsWizardOpen(true);
  };

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post);
    setIsWizardOpen(true);
  };

  const handleSavePost = (postData: Partial<SocialPost>) => {
    if (!campaign) return;

    let updatedPosts = [...campaign.posts];
    
    if (editingPost) {
      updatedPosts = updatedPosts.map(p => 
        p.id === editingPost.id ? { ...p, ...postData, updatedAt: new Date() } as SocialPost : p
      );
    } else {
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        campaignId: campaign.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SocialPost;
      updatedPosts.push(newPost);
    }

    const updatedCampaign = { ...campaign, posts: updatedPosts, updatedAt: new Date() };
    saveCampaign(updatedCampaign);
    setCampaign(updatedCampaign);
    setIsWizardOpen(false);
    setEditingPost(undefined);
  };

  const handleUpdateCampaign = (updates: Partial<Campaign>) => {
    if (!campaign) return;
    const updated = { ...campaign, ...updates, updatedAt: new Date() };
    saveCampaign(updated);
    setCampaign(updated);
  };

  const handleDeleteCampaign = () => {
    if (!campaign) return;
    deleteCampaign(campaign.id);
    router.push('/dashboard/communication');
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <IconButton 
            icon={ArrowLeft} 
            variant="ghost" 
            ariaLabel="Retour" 
            onClick={() => router.push('/dashboard/communication')}
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-foreground">{campaign.name}</h1>
              <Badge variant="secondary" className="capitalize">
                {campaign.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '?'} 
                  {' → '}
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '?'}
                </span>
              </div>
              <div>•</div>
              <div>{campaign.posts.length} posts</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-card-bg border border-border-custom rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vue Liste"
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 transition-colors ${viewMode === 'timeline' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vue Timeline"
            >
              <CalendarRange size={18} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vue Kanban"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={16} className="mr-2" />
            Paramètres
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreatePost}>
            <Plus size={16} className="mr-2" />
            Nouveau Post
          </Button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="h-[calc(100vh-12rem)] flex gap-4 overflow-hidden">
        {/* Sidebar gauche : Liste des posts */}
        <div className="w-80 flex-shrink-0">
          <CampaignSidebar 
            posts={campaign.posts}
            selectedPostId={selectedPost?.id}
            onSelectPost={setSelectedPost}
          />
        </div>

        {/* Panneau principal */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' && selectedPost && (
            <PostDetailPanel 
              post={selectedPost} 
              onEdit={() => handleEditPost(selectedPost)}
            />
          )}
          
          {viewMode === 'kanban' && (
            <PostKanbanBoard 
              posts={campaign.posts}
              onEditPost={handleEditPost}
            />
          )}

          {viewMode === 'timeline' && (
            <div className="h-full bg-card-bg border border-border-custom rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Vue Timeline à venir</p>
            </div>
          )}

          {viewMode === 'list' && !selectedPost && campaign.posts.length > 0 && (
            <div className="h-full bg-card-bg border border-border-custom rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Sélectionnez un post dans la sidebar</p>
            </div>
          )}

          {campaign.posts.length === 0 && (
            <div className="h-full bg-card-bg border border-border-custom rounded-xl flex flex-col items-center justify-center">
              <Plus size={48} className="text-muted-foreground/50 mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">Aucun post</h3>
              <p className="text-sm text-muted-foreground mb-6">Créez votre premier post pour cette campagne</p>
              <Button variant="primary" onClick={handleCreatePost}>
                <Plus size={16} className="mr-2" />
                Créer un post
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {campaign && (
        <CampaignSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          campaign={campaign}
          onUpdate={handleUpdateCampaign}
          onDelete={handleDeleteCampaign}
        />
      )}

      {/* Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg border border-border-custom rounded-xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl">
            <PostCreationWizard 
              campaignId={campaignId}
              onSave={handleSavePost}
              onCancel={() => setIsWizardOpen(false)}
              initialData={editingPost}
            />
          </div>
        </div>
      )}
    </div>
  );
};
