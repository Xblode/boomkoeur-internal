'use client';

import React from 'react';
import { SocialPost, Campaign } from '@/types/communication';
import { Badge } from '@/components/ui/atoms';
import { Clock, Instagram } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ReviewPendingPostsProps {
  campaigns: Campaign[];
  onPostClick?: (post: SocialPost, campaign: Campaign) => void;
}

export const ReviewPendingPosts: React.FC<ReviewPendingPostsProps> = ({
  campaigns,
  onPostClick,
}) => {
  // Récupérer tous les posts en revue avec leur campagne
  const postsInReview = campaigns.flatMap(campaign =>
    campaign.posts
      .filter(post => post.status === 'review')
      .map(post => ({ post, campaign }))
  );

  if (postsInReview.length === 0) {
    return null;
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Post';
      case 'carousel': return 'Carrousel';
      case 'reel': return 'Reel';
      case 'story': return 'Story';
      default: return type;
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-lg font-semibold text-foreground">
          Posts en attente de révision
        </h2>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
          {postsInReview.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {postsInReview.map(({ post, campaign }) => (
          <div
            key={post.id}
            onClick={() => onPostClick?.(post, campaign)}
            className="group flex gap-3 p-3 bg-card-bg border border-border-custom rounded-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            {/* Image de preview - Compacte */}
            <div className="h-16 w-16 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden border border-border-custom">
              {post.media[0] ? (
                <img
                  src={post.media[0]}
                  alt="Post preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>
              )}
            </div>

            {/* Infos du post - Layout optimisé */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {getPlatformIcon(post.platform)}
                    {getPostTypeLabel(post.type)}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {format(new Date(post.createdAt), 'dd MMM', { locale: fr })}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {post.caption || <span className="italic text-muted-foreground">Sans légende</span>}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <p className="text-xs text-muted-foreground truncate max-w-[120px]" title={campaign.name}>
                  {campaign.name}
                </p>
                <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-500 animate-pulse" title="En révision" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
