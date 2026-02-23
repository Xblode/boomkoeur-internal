'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

/**
 * BackLink - Lien "Retour" avec icône ArrowLeft
 *
 * Utilisé en haut de la sidebar de page pour revenir à la liste parente
 * (ex: "Retour aux événements", "Retour aux réunions").
 */
export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground transition-colors w-full px-2 py-1.5 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50',
        className
      )}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </Link>
  );
}
