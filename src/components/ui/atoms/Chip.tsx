import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export type ChipVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'info'
  | 'success'
  | 'warning'
  | 'destructive';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onDelete?: () => void;
  variant?: ChipVariant;
}

const chipVariants: Record<ChipVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  secondary: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  outline: 'border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
};

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, label, onDelete, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border pl-2.5 py-0.5 text-xs font-medium transition-colors',
          onDelete ? 'pr-1' : 'pr-2.5',
          chipVariants[variant],
          className
        )}
        {...props}
      >
        <span>{label}</span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors shrink-0"
          >
            <X size={9} />
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = 'Chip';
