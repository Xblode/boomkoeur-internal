'use client';

import React from 'react';
import { SocialPost, PostStatus } from '@/types/communication';
import { PostKanbanCard } from './PostKanbanCard';

interface PostKanbanBoardProps {
  posts: SocialPost[];
  onEditPost: (post: SocialPost) => void;
}

const COLUMNS: { id: PostStatus; label: string; color: string }[] = [
  { id: 'brainstorming', label: 'Brainstorming', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'created', label: 'En cours', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'review', label: 'Revue', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'validated', label: 'Validé', color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'scheduled', label: 'Planifié', color: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'published', label: 'Publié', color: 'bg-zinc-50 dark:bg-zinc-900/20' },
];

export const PostKanbanBoard: React.FC<PostKanbanBoardProps> = ({ posts, onEditPost }) => {
  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 h-full min-w-max pb-4">
        {COLUMNS.map((col) => {
          const colPosts = posts.filter(p => p.status === col.id);
          
          return (
            <div key={col.id} className="w-80 flex flex-col h-full rounded-xl bg-card-bg border border-border-custom shadow-sm overflow-hidden">
              {/* Column Header */}
              <div className={`p-3 border-b border-border-custom flex items-center justify-between ${col.color}`}>
                <h3 className="font-semibold text-sm text-foreground">{col.label}</h3>
                <span className="text-xs text-muted-foreground bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                  {colPosts.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                {colPosts.map(post => (
                  <PostKanbanCard key={post.id} post={post} onClick={() => onEditPost(post)} />
                ))}
                
                {colPosts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs italic border-2 border-dashed border-border-custom rounded-lg">
                    Aucun post
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
