'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PagePaddedContentProps {
  children: React.ReactNode;
  className?: string;
  /** Désactive le padding et max-width (ex: design-system) */
  noPadding?: boolean;
}

/**
 * PagePaddedContent - Wrapper pour le contenu des pages liste (sans PageContentLayout).
 * Applique padding et max-width au contenu.
 * Utilisé par le layout pour les pages qui n'ont pas toolbar/sidebar.
 */
export function PagePaddedContent({
  children,
  className,
  noPadding,
}: PagePaddedContentProps) {
  if (noPadding) {
    return <div className={cn('flex-1 min-w-0', className)}>{children}</div>;
  }
  return (
    <div className={cn('flex-1 min-w-0 p-6 md:p-8', className)}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
