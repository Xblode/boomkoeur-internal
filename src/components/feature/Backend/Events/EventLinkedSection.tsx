"use client";

import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { SectionHeader } from '@/components/ui';
import { EmptyState } from '@/components/ui/molecules';
import { useEventDetail } from './EventDetailProvider';

export function EventLinkedSection() {
  const { event, linkedCampaigns } = useEventDetail();

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<LinkIcon size={28} />}
        title="Éléments liés"
        subtitle="Produits, réunions et autres éléments associés."
      />
      <div className="pb-4 border-b border-border-custom">
        <p className="text-zinc-500 mt-1">Campagnes et transactions associées à cet événement.</p>
      </div>
      {event.linkedElements.length > 0 || linkedCampaigns.length > 0 ? (
        <div className="space-y-2">
          {linkedCampaigns.map((campaign) => (
            <div key={campaign.id} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">Campagne</span>
              <span className="text-zinc-400">•</span>
              <span className="text-sm">{campaign.name}</span>
              <span className="ml-auto text-xs text-zinc-500">
                {campaign.posts.length} post{campaign.posts.length > 1 ? 's' : ''}
              </span>
            </div>
          ))}
          {event.linkedElements.map((element) => (
            <div key={element.id} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">
                {element.type === 'campaign' ? 'Campagne' : 'Transaction'}
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-sm">{element.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={LinkIcon}
          title="Aucun élément lié pour le moment"
          description="Les campagnes peuvent être liées depuis le module Communication"
          variant="compact"
        />
      )}
    </div>
  );
}
