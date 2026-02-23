'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type PageContentMaxWidth = '4xl' | '5xl' | '6xl' | '7xl';

export interface PageContentLayoutProps {
  alert?: React.ReactNode;
  toolbar?: React.ReactNode;
  sectionHeader?: React.ReactNode;
  maxWidth?: PageContentMaxWidth;
  children: React.ReactNode;
  className?: string;
}

const maxWidthClasses: Record<PageContentMaxWidth, string> = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

/**
 * PageContentLayout - Wrapper du contenu principal de page
 *
 * Structure (de haut en bas) :
 * - Bloc fixe : alert (optionnel) + toolbar (optionnel) — toujours visible
 * - Zone scrollable : sectionHeader (optionnel) + children
 *
 * Seul le contenu défile, l'alerte et la toolbar restent visibles en haut.
 */
export function PageContentLayout({
  alert,
  toolbar,
  sectionHeader,
  maxWidth = '6xl',
  children,
  className,
}: PageContentLayoutProps) {
  return (
    <main className={cn('flex-1 min-w-0 flex flex-col min-h-0', className)}>
      {(alert || toolbar) && (
        <div className="shrink-0 flex flex-col z-20">
          {alert}
          {toolbar}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-8 md:p-12">
        <div className={cn('mx-auto', maxWidthClasses[maxWidth])}>
          {sectionHeader}
          {children}
        </div>
      </div>
    </main>
  );
}
