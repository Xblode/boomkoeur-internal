'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SectionNavLinkProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  className?: string;
}

/**
 * SectionNavLink - Lien ou bouton de navigation dans la sidebar de page
 *
 * Utilisé pour les sections (ex: "Contacts", "Trésorerie", "Informations").
 * Si href est fourni, rend un Link. Sinon rend un button avec onClick.
 */
export function SectionNavLink({
  href,
  onClick,
  icon,
  label,
  active,
  className,
}: SectionNavLinkProps) {
  const baseStyles =
    'flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors';
  const activeStyles =
    'bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium';
  const inactiveStyles =
    'text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50';

  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseStyles, active ? activeStyles : inactiveStyles, className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(baseStyles, active ? activeStyles : inactiveStyles, className)}
    >
      {content}
    </button>
  );
}
