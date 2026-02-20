'use client';

import React from 'react';
import { SocialPost } from '@/types/communication';
import { Button, Badge } from '@/components/ui/atoms';
import { Edit, Calendar, Hash, AtSign, Music, Sparkles } from 'lucide-react';

interface PostDetailPanelProps {
  post: SocialPost;
  onEdit: () => void;
}

export const PostDetailPanel: React.FC<PostDetailPanelProps> = ({ post, onEdit }) => {
  const getStatusColor = () => {
    const colors = {
      brainstorming: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      created: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      validated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      published: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    };
    return colors[post.status];
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="space-y-4">
        {/* Header Card */}
        <div className="bg-card-bg border border-border-custom rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className={getStatusColor()}>
                  {post.status}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">
                  {post.type} • {post.platform}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {post.brainstorming?.objective || "Post sans titre"}
              </h2>
            </div>
            <Button variant="primary" size="sm" onClick={onEdit}>
              <Edit size={14} className="mr-2" />
              Modifier
            </Button>
          </div>

          {/* Date planifiée */}
          {post.scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
              <Calendar size={16} />
              <span className="font-medium">
                Planifié le{' '}
                {new Date(post.scheduledDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Brainstorming */}
        {post.brainstorming && (
          <div className="bg-card-bg border border-border-custom rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-yellow-500" />
              <h3 className="font-semibold text-foreground">Brainstorming</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Objectif</span>
                <p className="text-sm text-foreground mt-1">{post.brainstorming.objective}</p>
              </div>
              {post.brainstorming.targetAudience && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Public cible</span>
                  <p className="text-sm text-foreground mt-1">{post.brainstorming.targetAudience}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brief</span>
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{post.brainstorming.brief}</p>
              </div>
            </div>
          </div>
        )}

        {/* Visuels */}
        {post.media && post.media.length > 0 && (
          <div className="bg-card-bg border border-border-custom rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Visuels</h3>
            <div className="flex flex-wrap gap-3">
              {post.media.map((url, i) => (
                <div key={i} className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img src={url} alt={`Média ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className="bg-card-bg border border-border-custom rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Contenu</h3>
          
          {/* Caption */}
          {post.caption && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Légende</span>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                {post.caption}
              </p>
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={14} className="text-blue-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tagged Users */}
          {post.taggedUsers && post.taggedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AtSign size={14} className="text-purple-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personnes taguées</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.taggedUsers.map((user, i) => (
                  <span key={i} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">
                    {user}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Musique */}
          {post.music && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Music size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Musique</span>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm text-foreground font-medium">{post.music.title}</p>
                <p className="text-xs text-muted-foreground">{post.music.artist}</p>
              </div>
            </div>
          )}

          {/* Collaboration */}
          {post.collaboration && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collaboration</span>
              <p className="text-sm text-foreground mt-1">{post.collaboration}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
