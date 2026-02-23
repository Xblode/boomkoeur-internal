'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SidebarHeaderProps {
  /** Titre du header */
  title: string;
  /** Actions optionnelles (ex: bouton + dropdown). Quand fourni, affiché à droite. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * SidebarHeader - En-tête de section dans la sidebar
 *
 * Deux variantes :
 * - Sans actions : titre seul
 * - Avec actions : titre + slot pour boutons/dropdown à droite
 */
export function SidebarHeader({ title, actions, className }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        actions ? 'gap-2' : '',
        className
      )}
    >
      <h2 className="font-bold text-sm shrink-0">{title}</h2>
      {actions && <div className="flex shrink-0">{actions}</div>}
    </div>
  );
}
