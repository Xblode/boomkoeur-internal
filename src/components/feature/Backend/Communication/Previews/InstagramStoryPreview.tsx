'use client';

import React from 'react';
import { Music, X } from 'lucide-react';
import { SocialPost } from '@/types/communication';
import { Avatar } from '@/components/ui/atoms';

interface InstagramStoryPreviewProps {
  post: SocialPost;
  username?: string;
  userAvatar?: string;
}

/**
 * Composant de prévisualisation d'une Story Instagram
 * Format 9:16 avec overlays interactifs
 */
export const InstagramStoryPreview: React.FC<InstagramStoryPreviewProps> = ({
  post,
  username = 'boomkoeur',
  userAvatar = '',
}) => {
  const backgroundImage = post.media[0] || 'https://via.placeholder.com/400x700';

  return (
    <div className="relative w-full max-w-[375px] mx-auto">
      {/* Conteneur Story format 9:16 */}
      <div className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Image de fond */}
        <img
          src={backgroundImage}
          alt="Story preview"
          className="w-full h-full object-cover"
        />

        {/* Overlay gradient pour le texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

        {/* Header de la story */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {/* Progress bar */}
            <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full w-full bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="absolute top-8 left-0 right-0 px-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Avatar 
              src={userAvatar} 
              alt={username}
              size="sm"
              className="border-2 border-white"
            />
            <span className="text-white font-semibold text-sm drop-shadow-lg">
              {username}
            </span>
            <span className="text-white/80 text-xs">Maintenant</span>
          </div>
          <button className="text-white">
            <X size={24} />
          </button>
        </div>

        {/* Musique si présente */}
        {post.music && (
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-2">
              <Music size={16} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">
                  {post.music.title}
                </div>
                <div className="text-xs text-white/70 truncate">
                  {post.music.artist}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Éléments interactifs */}
        {post.storyInteractive && (
          <div className="absolute bottom-32 left-4 right-4 z-10">
            {/* Sondage */}
            {post.storyInteractive.type === 'poll' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                <p className="text-gray-900 font-semibold mb-3 text-center">
                  {post.storyInteractive.data.question}
                </p>
                <div className="space-y-2">
                  {post.storyInteractive.data.options?.map((option, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-full py-2 px-4 text-center text-sm font-medium"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question */}
            {post.storyInteractive.type === 'question' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                <p className="text-gray-900 font-semibold mb-2">
                  {post.storyInteractive.data.question}
                </p>
                <div className="bg-gray-100 rounded-full py-2 px-4 text-sm text-gray-500">
                  Écrivez votre réponse...
                </div>
              </div>
            )}

            {/* Lien */}
            {post.storyInteractive.type === 'link' && post.storyInteractive.data.url && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2">
                <span className="text-sm font-semibold">Voir plus</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            )}

            {/* Countdown */}
            {post.storyInteractive.type === 'countdown' && (
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
                <p className="font-semibold mb-2">
                  {post.storyInteractive.data.question}
                </p>
                <div className="text-3xl font-bold">
                  7j 5h 23m
                </div>
              </div>
            )}
          </div>
        )}

        {/* Caption en bas */}
        {post.caption && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p className="text-white text-sm drop-shadow-lg">
              {post.caption}
            </p>
          </div>
        )}

        {/* Statut de planification */}
        {post.scheduledDate && (
          <div className="absolute top-20 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs z-10">
            📅 {new Date(post.scheduledDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
};
