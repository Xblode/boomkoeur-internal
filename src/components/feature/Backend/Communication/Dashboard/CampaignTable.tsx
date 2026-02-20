'use client';

import React, { useState } from 'react';
import { Plus, Calendar, Users, Eye, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Campaign } from '@/types/communication';
import { Button, Badge, IconButton, Progress } from '@/components/ui/atoms';

interface CampaignTableProps {
  campaigns: Campaign[];
  onViewCampaign?: (campaign: Campaign) => void;
  onEditCampaign?: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaignId: string) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      active: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Campaign['status']) => {
    const labels = {
      draft: 'Brouillon',
      active: 'Active',
      completed: 'Terminée',
      archived: 'Archivée',
    };
    return labels[status];
  };

  // Calcul de progression pour chaque campagne
  const getProgress = (campaign: Campaign) => {
    if (campaign.posts.length === 0) return 0;
    const completed = campaign.posts.filter(
      p => p.status === 'published' || p.status === 'scheduled' || p.status === 'validated'
    ).length;
    return Math.round((completed / campaign.posts.length) * 100);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return '...';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Cards de résumé (Stats rapides au-dessus de la liste) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card-bg border border-border-custom rounded-lg p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actives</span>
          <span className="text-2xl font-bold text-foreground mt-1">
            {campaigns.filter(c => c.status === 'active').length}
          </span>
        </div>
        <div className="bg-card-bg border border-border-custom rounded-lg p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Posts prévus</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {campaigns.reduce((acc, c) => acc + c.posts.filter(p => p.status === 'scheduled').length, 0)}
          </span>
        </div>
        <div className="bg-card-bg border border-border-custom rounded-lg p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cette semaine</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {/* Mock value pour l'instant */}
            3
          </span>
        </div>
      </div>

      {/* Liste des campagnes (Cards) */}
      <div className="flex-1 overflow-auto space-y-4">
      <h2 className="text-xl font-bold">Mes Camapagnes</h2> 
        {campaigns.map((campaign) => {
          const progress = getProgress(campaign);
          
          return (
            <div
              key={campaign.id}
              className={`
                group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4
                bg-card-bg border border-border-custom rounded-xl shadow-sm
                hover:shadow-md
                transition-all duration-200 cursor-pointer
                ${selectedCampaign === campaign.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
              onClick={() => onViewCampaign?.(campaign)}
            >
              {/* Infos principales */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base text-foreground transition-colors">
                    {campaign.name}
                  </h3>
                  
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(campaign.status)}`}
                  >
                    {getStatusLabel(campaign.status)}
                  </Badge>

                  {campaign.type === 'event' && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                      <Calendar size={12} />
                      <span>Événement</span>
                    </div>
                  )}

                  <ArrowRight className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2" size={16} />
                </div>

                {campaign.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                    {campaign.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>
                      {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progression et Actions */}
              <div className="w-full sm:w-64 flex flex-col gap-2 pl-0 sm:pl-6 sm:border-l border-border-custom">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-medium text-foreground">Progression</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 w-full" />
                
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    {campaign.posts.filter(p => p.status === 'published' || p.status === 'validated').length} terminés
                  </span>
                  <span className="flex items-center gap-1">
                     {campaign.posts.length} total
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card-bg border border-border-custom rounded-xl border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune campagne active
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Lancez votre première campagne pour organiser vos posts et booster votre visibilité.
            </p>
            <Button onClick={() => {}} variant="outline">
              Créer une campagne
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
