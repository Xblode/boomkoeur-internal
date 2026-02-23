import React from 'react';
import { cn } from '@/lib/utils';

export type TagVariant =
  | 'default'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'destructive';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variante de couleur (alignée Badge/EventStatusBadge) */
  variant?: TagVariant;
  /** Afficher le point indicateur à gauche */
  showDot?: boolean;
}

const tagVariants: Record<TagVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  secondary: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
};

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', showDot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
          tagVariants[variant],
          className
        )}
        {...props}
      >
        {showDot && (
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              variant === 'info' && 'bg-blue-600 dark:bg-blue-400',
              variant === 'success' && 'bg-green-600 dark:bg-green-400',
              variant === 'warning' && 'bg-yellow-600 dark:bg-yellow-400',
              variant === 'destructive' && 'bg-red-600 dark:bg-red-400',
              (variant === 'default' || variant === 'secondary') && 'bg-zinc-500 dark:bg-zinc-400'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);
Tag.displayName = 'Tag';

export type DotVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface DotProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: DotVariant;
  animate?: boolean;
}

const dotColors: Record<DotVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-zinc-400',
};

export const Dot = React.forwardRef<HTMLSpanElement, DotProps>(
  ({ className, variant = 'neutral', animate = false, ...props }, ref) => {
    return (
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {animate && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              dotColors[variant]
            )}
          />
        )}
        <span
          ref={ref}
          className={cn(
            'relative inline-flex h-2.5 w-2.5 rounded-full',
            dotColors[variant],
            className
          )}
          {...props}
        />
      </span>
    );
  }
);
Dot.displayName = 'Dot';
