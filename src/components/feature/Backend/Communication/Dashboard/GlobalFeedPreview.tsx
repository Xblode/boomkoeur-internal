'use client';

import React, { useMemo } from 'react';
import { Calendar, Clock, Image as ImageIcon, Grid, Play, User, Settings, Bookmark, Search } from 'lucide-react';
import { SocialPost, PublishedPost } from '@/types/communication';
import { Avatar, Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

interface GlobalFeedPreviewProps {
  publishedPosts: PublishedPost[];
  scheduledPosts: SocialPost[];
  onPostClick?: (post: PublishedPost | SocialPost) => void;
}

type FeedItem = {
  id: string;
  type: 'published' | 'scheduled';
  media: string;
  date: Date;
  caption?: string;
  status?: SocialPost['status'];
  postType?: string;
};

export const GlobalFeedPreview: React.FC<GlobalFeedPreviewProps> = ({
  publishedPosts,
  scheduledPosts,
  onPostClick,
}) => {
  const feedItems: FeedItem[] = useMemo(() => {
    const published: FeedItem[] = publishedPosts.map((post) => ({
      id: post.id,
      type: 'published' as const,
      media: post.media,
      date: new Date(post.publishedDate),
      caption: post.caption,
      postType: post.type,
    }));

    const scheduled: FeedItem[] = scheduledPosts
      .filter((post) => post.media[0] && post.scheduledDate)
      .map((post) => ({
        id: post.id,
        type: 'scheduled' as const,
        media: post.media[0],
        date: new Date(post.scheduledDate!),
        caption: post.caption,
        status: post.status,
        postType: post.type,
      }));

    return [...published, ...scheduled].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [publishedPosts, scheduledPosts]);

  return (
    <div className="h-full flex flex-col bg-card-bg border border-border-custom rounded-lg shadow-sm overflow-hidden">
      {/* Header Instagram Style (Mobile Layout) */}
      <div className="p-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold text-foreground">boomkoeur.exe</h2>
            <div className="bg-red-500 rounded-full w-2 h-2 ml-1" title="Notification"></div>
          </div>
          <div className="flex gap-4 text-foreground">
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              <svg aria-label="Notifications" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
            </div>
            <Settings size={24} strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex items-center gap-8 mb-4">
          {/* Avatar avec cercle story */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
              <div className="w-full h-full rounded-full bg-card-bg p-[2px]">
                <Avatar size="lg" src="" alt="Boomkoeur" className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex justify-around items-center text-center">
            <div>
              <div className="font-bold text-lg text-foreground leading-tight">32</div>
              <div className="text-xs text-foreground/80">publications</div>
            </div>
            <div>
              <div className="font-bold text-lg text-foreground leading-tight">933</div>
              <div className="text-xs text-foreground/80">followers</div>
            </div>
            <div>
              <div className="font-bold text-lg text-foreground leading-tight">77</div>
              <div className="text-xs text-foreground/80">suivi(e)s</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <div className="font-bold text-sm text-foreground">BOOMKŒUR</div>
          <div className="text-sm text-muted-foreground dark:text-zinc-300">Événement</div>
          <div className="text-sm text-foreground whitespace-pre-line mt-0.5">
            Association Havraise d&apos;événementiel techno ⚓{'\n'}
            Vivre de Techno et d&apos;eau fraîche 🧬{'\n'}
            📩 boomkoeur.asso@gmail.com
          </div>
          <a href="#" className="text-sm text-blue-500 font-medium flex items-center gap-1 mt-0.5">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            linktr.ee/boomkoeur
          </a>
          
          <div className="flex items-center gap-2 mt-3 text-xs text-foreground/70">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-gray-300 border border-card-bg"></div>
              <div className="w-5 h-5 rounded-full bg-gray-400 border border-card-bg"></div>
            </div>
            <span><span className="font-semibold text-foreground">307 autres personnes</span> que vous connaissez suivent</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button variant="secondary" className="flex-1 h-8 bg-muted text-foreground font-semibold text-sm rounded-lg hover:bg-muted/80">
            Suivi(e)
            <span className="ml-1 text-xs">▼</span>
          </Button>
          <Button variant="secondary" className="flex-1 h-8 bg-muted text-foreground font-semibold text-[12px] rounded-lg hover:bg-muted/80">
            Envoyer un message
          </Button>
          <Button variant="secondary" className="w-8 h-8 px-0 bg-muted text-foreground rounded-lg hover:bg-muted/80 flex items-center justify-center">
            <svg aria-label="Personnes suggérées" fill="currentColor" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M12.001 1.002a11 11 0 1 0 .002 21.998 11 11 0 0 0-.002-21.998zm5 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-5 13.003a9.006 9.006 0 0 1-5.998-2.275 6.002 6.002 0 0 1 11.996 0A9.006 9.006 0 0 1 12.001 21.005z"></path></svg>
          </Button>
        </div>

        {/* Highlights */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {[
            { name: 'Wrapped 2...', img: 'bg-red-500' },
            { name: 'Événements', img: 'bg-white' },
            { name: 'Calendrier', img: 'bg-white' },
            { name: 'Artistes', img: 'bg-white' },
            { name: 'Règles', img: 'bg-white' },
            { name: 'Presse', img: 'bg-white' },
            { name: 'Contact', img: 'bg-white' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer flex-shrink-0">
              <div className="w-[64px] h-[64px] rounded-full border border-border-custom p-[2px] bg-card-bg">
                <div className={`w-full h-full rounded-full flex items-center justify-center bg-zinc-900 overflow-hidden`}>
                   {/* Placeholder icon inside highlight */}
                   {item.name === 'Calendrier' ? <Calendar size={32} className="text-white" /> :
                    item.name === 'Événements' ? <Bookmark size={32} className="text-white fill-white" /> :
                    <div className={`w-full h-full ${item.img}`}></div>
                   }
                </div>
              </div>
              <span className="text-xs text-foreground truncate max-w-[72px]">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border-custom bg-card-bg sticky top-0 z-10">
        <div className="flex-1 flex justify-center py-2.5 border-b-[1px] border-foreground cursor-pointer">
          <Grid size={24} className="text-foreground" />
        </div>
        <div className="flex-1 flex justify-center py-2.5 border-b-[1px] border-transparent cursor-pointer">
          <Play size={24} className="text-muted-foreground opacity-50" />
        </div>
        <div className="flex-1 flex justify-center py-2.5 border-b-[1px] border-transparent cursor-pointer">
          <div className="relative">
             <svg aria-label="" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24" className="text-muted-foreground opacity-50"><path d="M12.001 2.002a9.998 9.998 0 1 0-.002 19.996 9.998 9.998 0 0 0 .002-19.996Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M17.772 17.27a4.996 4.996 0 0 0-3.77-4.268 4 4 0 1 0-4.004 0 4.996 4.996 0 0 0-3.77 4.268" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </div>
        </div>
        <div className="flex-1 flex justify-center py-2.5 border-b-[1px] border-transparent cursor-pointer">
          <div className="w-6 h-6 border-2 border-muted-foreground rounded-md flex items-center justify-center opacity-50">
             <User size={16} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto bg-card-bg">
        <div className="grid grid-cols-3 gap-0.5">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "relative aspect-[4/5] cursor-pointer overflow-hidden group bg-muted",
                item.type === 'scheduled' ? "opacity-90 ring-2 ring-blue-500/20 z-10" : ""
              )}
              onClick={() => onPostClick?.(item as any)}
            >
              <img
                src={item.media}
                alt="Post"
                className="w-full h-full object-cover"
              />
              
              {/* Pinned Icon */}
              {/* Only for first 3 posts to mimic screenshot */}
              {(item.id === 'pub-1' || item.id === 'pub-2' || item.id === 'pub-3') && (
                <div className="absolute top-2 right-2 z-20">
                   <svg aria-label="Épinglé" className="x1lliihq x1n2onr6 x5n08af" fill="white" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M16 11.25v-4.5a4 4 0 1 0-8 0v4.5a3.257 3.257 0 0 1-2.029 3.015L5 14.646a.75.75 0 0 0 .28 1.354h5.22v5.25a1.5 1.5 0 0 0 3 0v-5.25h5.22a.75.75 0 0 0 .28-1.354l-.971-1.381A3.257 3.257 0 0 1 16 11.25Z"></path></svg>
                </div>
              )}

              {/* Type Indicator Icon (Reel/Carousel) */}
              <div className="absolute top-2 right-2 z-20">
                {item.postType === 'carousel' && (
                  <div className="p-1">
                    <svg className="w-4 h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM13 4a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V5a1 1 0 00-1-1h-3zM13 14a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 00-1-1h-3z" /></svg>
                  </div>
                )}
                {item.postType === 'reel' && (
                  <div className="p-1">
                    <Play size={16} className="text-white fill-white drop-shadow-md" />
                  </div>
                )}
              </div>

              {/* Status Indicator (Scheduled) */}
              {item.type === 'scheduled' && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 flex items-center justify-center gap-1 backdrop-blur-sm">
                  <Clock size={10} />
                  <span>{item.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Empty State Filler */}
          {feedItems.length === 0 && (
            <div className="col-span-3 py-20 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-16 h-16 border-2 border-muted rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={32} className="opacity-50" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Aucune publication</h3>
              <p className="text-sm">Vos photos et vidéos apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
