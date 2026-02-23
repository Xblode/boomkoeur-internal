'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EmptyStateVariant = 'full' | 'compact' | 'inline';

export interface EmptyStateProps {
  /** Icône Lucide à afficher */
  icon?: LucideIcon;
  /** Titre principal */
  title: string;
  /** Description optionnelle */
  description?: string;
  /** Action (bouton, lien) optionnelle */
  action?: React.ReactNode;
  /** Variante visuelle : full (défaut), compact, inline */
  variant?: EmptyStateVariant;
  /** Classes CSS additionnelles */
  className?: string;
}

const variantStyles: Record<
  EmptyStateVariant,
  { container: string; iconWrapper: string; iconSize: string; title: string; description: string }
> = {
  full: {
    container:
      'flex flex-col items-center justify-center text-center p-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent h-full w-full min-h-[300px]',
    iconWrapper: 'mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-full',
    iconSize: 'w-8 h-8 text-zinc-400 dark:text-zinc-500',
    title: 'text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2',
    description: 'text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-2',
  },
  compact: {
    container:
      'flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent h-full w-full min-h-[200px]',
    iconWrapper: 'mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-full',
    iconSize: 'w-6 h-6 text-zinc-400 dark:text-zinc-500',
    title: 'text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1.5',
    description: 'text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-1.5',
  },
  inline: {
    container:
      'flex flex-col items-center justify-center text-center py-8 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md bg-transparent',
    iconWrapper: 'mb-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-full',
    iconSize: 'w-5 h-5 text-zinc-400 dark:text-zinc-500',
    title: 'text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1',
    description: 'text-xs text-zinc-500 dark:text-zinc-400 max-w-xs',
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'full',
  className,
}: EmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)}>
      {Icon && (
        <div className={styles.iconWrapper}>
          <Icon className={styles.iconSize} />
        </div>
      )}

      <h3 className={styles.title}>{title}</h3>

      {description && <p className={styles.description}>{description}</p>}

      {action && (
        <div className={variant === 'inline' ? 'mt-2' : 'mt-4'}>{action}</div>
      )}
    </div>
  );
}
