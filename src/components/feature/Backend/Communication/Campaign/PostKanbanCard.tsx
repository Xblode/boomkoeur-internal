'use client';

import React from 'react';
import { SocialPost } from '@/types/communication';
import { Instagram, Youtube, Facebook, Video, Image, FileText, Music, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/atoms';

interface PostKanbanCardProps {
  post: SocialPost;
  onClick: () => void;
}

export const PostKanbanCard: React.FC<PostKanbanCardProps> = ({ post, onClick }) => {
  const getTypeIcon = () => {
    switch (post.type) {
      case 'reel': return <Video size={14} />;
      case 'story': return <Clock size={14} />; // Story ephemeral
      case 'carousel': return <Image size={14} className="stroke-[3]" />; // Stacked images
      default: return <Image size={14} />;
    }
  };

  return (
    <div 
      className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      {/* Header: Platform & Type */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {post.platform === 'instagram' && <Instagram size={14} />}
          <span className="capitalize">{post.type}</span>
        </div>
        {post.scheduledDate && (
          <div className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1">
            <Clock size={10} />
            {new Date(post.scheduledDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden relative">
          {post.media && post.media.length > 0 ? (
            <img src={post.media[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {getTypeIcon()}
            </div>
          )}
          <div className="absolute top-1 right-1 bg-black/50 p-0.5 rounded text-white">
            {getTypeIcon()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-1">
            {post.brainstorming?.objective || "Sans titre"}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {post.caption || post.brainstorming?.brief || "Pas de description"}
          </p>
        </div>
      </div>

      {/* Footer: Tags & Assignees (Mock) */}
      <div className="mt-3 flex items-center justify-between border-t border-border-custom pt-2">
        <div className="flex items-center gap-1">
          {/* Mock Assignee */}
          <Avatar size="sm" className="w-5 h-5" />
        </div>
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="text-[10px] text-muted-foreground">
            #{post.hashtags[0]} {post.hashtags.length > 1 && `+${post.hashtags.length - 1}`}
          </div>
        )}
      </div>
    </div>
  );
};
