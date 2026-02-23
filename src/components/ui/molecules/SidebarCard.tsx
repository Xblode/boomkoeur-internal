'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Contenu personnalisé (ex: liste de posts). Quand fourni, affiche un layout vertical avec label + children. */
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  iconClassName?: string;
  className?: string;
}

/**
 * SidebarCard - Carte compacte dans la sidebar
 *
 * Utilisé pour afficher des infos ou liens rapides (ex: prochain événement,
 * prochaine réunion, posts du jour dans Calendar).
 */
export function SidebarCard({
  icon: Icon,
  title,
  subtitle,
  children,
  href,
  onClick,
  iconClassName = 'text-zinc-500',
  className,
}: SidebarCardProps) {
  const baseStyles =
    'p-3 rounded-md border border-border-custom bg-card-bg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left w-full';

  const wrapperClassName = children
    ? cn('flex flex-col gap-2', baseStyles)
    : cn('flex items-start gap-2', baseStyles);

  const content = children ? (
    <>
      <div className="flex items-center gap-2">
        <Icon size={14} className={cn('shrink-0', iconClassName)} />
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </>
  ) : (
    <>
      <Icon size={16} className={cn('shrink-0', iconClassName)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(wrapperClassName, className)}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(wrapperClassName, className)}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn(wrapperClassName, 'cursor-default', className)}>{content}</div>
  );
}

