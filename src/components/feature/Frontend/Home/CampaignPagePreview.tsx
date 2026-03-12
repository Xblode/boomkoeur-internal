'use client';

import React from 'react';
import { Instagram, Facebook, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Mockup de l'onglet Campagne d'une page Event (backend).
 * Représente le workflow et les posts.
 */
export const CampaignPagePreview: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-2xl',
        'aspect-[21/9] min-h-[90px] w-full mx-auto',
        className
      )}
    >
      <div className="w-full h-full flex flex-col bg-backend">
        {/* Main content — Campagne */}
        <main className="flex-1 min-w-0 overflow-hidden p-4 bg-backend">
          <div className="space-y-4">
            {/* Workflow phases */}
            <div className="flex gap-2">
              {['Préparation', 'Production', 'Communication', 'Post-Event'].map((phase, i) => (
                <div
                  key={phase}
                  className={cn(
                    'h-8 flex-1 rounded-md text-xs font-medium flex items-center justify-center',
                    i === 2
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-surface-subtle text-muted-foreground'
                  )}
                >
                  {phase}
                </div>
              ))}
            </div>

            {/* Posts grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { platform: 'Instagram', status: 'Publié', icon: Instagram, statusIcon: CheckCircle2, color: 'text-pink-600 dark:text-pink-400' },
                { platform: 'Facebook', status: 'Planifié', icon: Facebook, statusIcon: Clock, color: 'text-blue-600 dark:text-blue-400' },
                { platform: 'Instagram', status: 'À valider', icon: Instagram, statusIcon: Clock, color: 'text-pink-600 dark:text-pink-400' },
              ].map((post, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-semibold flex items-center gap-1', post.color)}>
                      <post.icon size={12} />
                      {post.platform}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <post.statusIcon size={10} />
                      {post.status}
                    </span>
                  </div>
                  <div className="w-full h-16 rounded bg-surface-subtle mb-2" />
                  <div className="h-3 w-3/4 bg-surface-subtle rounded mb-1" />
                  <div className="h-2 w-1/2 bg-surface-subtle rounded" />
                </div>
              ))}
            </div>

            {/* Planning social */}
            <div className="rounded-md border border-border-custom bg-card-bg p-2 shadow-sm">
              <h3 className="text-xs font-semibold text-foreground mb-2">Planning social</h3>
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 h-6 rounded bg-surface-subtle" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
