'use client';

import React from 'react';
import { SocialPost, PostStatus } from '@/types/communication';
import { Image, Video, Clock } from 'lucide-react';
import { Badge, Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

interface CampaignSidebarProps {
  posts: SocialPost[];
  selectedPostId?: string;
  onSelectPost: (post: SocialPost) => void;
}

const STATUS_CONFIG: Record<PostStatus, { label: string; dotColor: string }> = {
  brainstorming: { label: 'Brainstorming', dotColor: 'bg-gray-400' },
  created: { label: 'En cours', dotColor: 'bg-blue-500' },
  review: { label: 'En revue', dotColor: 'bg-yellow-500' },
  validated: { label: 'Validé', dotColor: 'bg-green-500' },
  scheduled: { label: 'Planifié', dotColor: 'bg-purple-500' },
  published: { label: 'Publié', dotColor: 'bg-zinc-400' },
};

export const CampaignSidebar: React.FC<CampaignSidebarProps> = ({
  posts,
  selectedPostId,
  onSelectPost,
}) => {
  // Grouper par statut
  const postsByStatus: Record<PostStatus, SocialPost[]> = {
    brainstorming: [],
    created: [],
    review: [],
    validated: [],
    scheduled: [],
    published: [],
  };

  posts.forEach(post => {
    postsByStatus[post.status].push(post);
  });

  const getTypeIcon = (type: SocialPost['type']) => {
    switch (type) {
      case 'reel': return <Video size={14} />;
      case 'story': return <Clock size={14} />;
      case 'carousel': return <Image size={14} className="stroke-[2.5]" />;
      default: return <Image size={14} />;
    }
  };

  return (
    <div className="h-full bg-card-bg border border-border-custom rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-custom">
        <h3 className="font-semibold text-foreground">Posts de la campagne</h3>
        <p className="text-xs text-muted-foreground mt-1">{posts.length} posts au total</p>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto">
        {(Object.keys(postsByStatus) as PostStatus[]).map(status => {
          const statusPosts = postsByStatus[status];
          if (statusPosts.length === 0) return null;

          return (
            <div key={status} className="border-b border-border-custom last:border-b-0">
              {/* Status Group Header */}
              <div className="px-4 py-2 bg-muted/30 sticky top-0 z-10">
                <div className="flex items-center justify-between w-full">
                  <Badge variant="secondary" className="text-xs font-semibold uppercase flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dotColor}`}></div>
                    {STATUS_CONFIG[status].label}
                  </Badge>
                  <span className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full shadow-sm">
                    {statusPosts.length}
                  </span>
                </div>
              </div>

              {/* Posts List */}
              <div className="py-1">
                {statusPosts.map(post => (
                  <Button
                    key={post.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectPost(post)}
                    className={cn(
                      "w-full p-3 flex items-center gap-3 transition-colors text-left border-l-2 border-transparent",
                      selectedPostId === post.id 
                        ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium" 
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden relative">
                      {post.media && post.media.length > 0 ? (
                        <img src={post.media[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {getTypeIcon(post.type)}
                        </div>
                      )}
                      <div className="absolute bottom-0.5 right-0.5 bg-black/60 p-0.5 rounded text-white">
                        {getTypeIcon(post.type)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1 leading-tight">
                        {post.brainstorming?.objective || "Sans titre"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {post.scheduledDate 
                          ? new Date(post.scheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : 'Date non définie'
                        }
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
