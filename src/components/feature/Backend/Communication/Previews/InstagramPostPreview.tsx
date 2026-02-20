'use client';

import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music } from 'lucide-react';
import { SocialPost } from '@/types/communication';
import { Avatar } from '@/components/ui/atoms';
import { IconButton } from '@/components/ui/atoms';

interface InstagramPostPreviewProps {
  post: SocialPost;
  username?: string;
  userAvatar?: string;
}

/**
 * Composant de prévisualisation d'un post Instagram
 * Reproduit fidèlement l'apparence d'un post Instagram
 */
export const InstagramPostPreview: React.FC<InstagramPostPreviewProps> = ({
  post,
  username = 'boomkoeur',
  userAvatar = '',
}) => {
  const mainImage = post.media[0] || 'https://via.placeholder.com/600';
  const isCarousel = post.type === 'carousel' && post.media.length > 1;

  return (
    <div className="w-full max-w-[468px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header du post */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar 
            src={userAvatar} 
            alt={username}
            size="md"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{username}</span>
            {post.location && (
              <span className="text-xs text-gray-500">{post.location}</span>
            )}
          </div>
        </div>
        <IconButton
          icon={MoreHorizontal}
          variant="ghost"
          size="sm"
          ariaLabel="Plus d'options"
        />
      </div>

      {/* Image du post */}
      <div className="relative w-full aspect-square bg-gray-100">
        <img
          src={mainImage}
          alt="Post preview"
          className="w-full h-full object-cover"
        />
        
        {/* Indicateur de carrousel */}
        {isCarousel && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {post.media.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Indicateur musique pour Reel */}
        {post.type === 'reel' && post.music && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
            <Music size={12} />
            <span>{post.music.title} • {post.music.artist}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <IconButton
              icon={Heart}
              variant="ghost"
              size="sm"
              ariaLabel="J'aime"
            />
            <IconButton
              icon={MessageCircle}
              variant="ghost"
              size="sm"
              ariaLabel="Commenter"
            />
            <IconButton
              icon={Send}
              variant="ghost"
              size="sm"
              ariaLabel="Partager"
            />
          </div>
          <IconButton
            icon={Bookmark}
            variant="ghost"
            size="sm"
            ariaLabel="Enregistrer"
          />
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{username}</span>
          <span className="text-gray-900 whitespace-pre-wrap">
            {post.caption}
          </span>
        </div>

        {/* Tagged users */}
        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <div className="text-xs text-blue-600 mt-2">
            {post.taggedUsers.join(' ')}
          </div>
        )}

        {/* Collaboration */}
        {post.collaboration && (
          <div className="text-xs text-gray-500 mt-1">
            En collaboration avec {post.collaboration}
          </div>
        )}

        {/* Date de publication prévue */}
        {post.scheduledDate && (
          <div className="text-xs text-gray-400 mt-2">
            📅 Planifié pour le {new Date(post.scheduledDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
};
