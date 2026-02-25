import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  fullWidth?: boolean;
  /** default = standard, sm = compact, xs = toolbar, table = cellule tableau (pleine largeur/hauteur, sans px) */
  size?: 'default' | 'sm' | 'xs' | 'table';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, fullWidth = false, size = 'default', className = '', disabled, ...props }, ref) => {
    const isXs = size === 'xs';
    const isSm = size === 'sm';
    const isTable = size === 'table';

    const baseStyles = isTable
      ? 'flex h-full min-h-8 w-full rounded-md border bg-transparent py-1 text-sm placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1'
      : isXs
        ? 'flex h-6 w-full rounded-md border bg-transparent px-2 py-0.5 text-xs placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1'
        : isSm
          ? 'flex h-8 w-full rounded-md border bg-transparent px-2.5 py-1 text-xs placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1'
          : 'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1';

    const normalStyles = 'border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300';
    const errorStyles = 'border-red-500 focus-visible:ring-red-500 text-red-600 dark:border-red-900 dark:text-red-500';
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, error ? errorStyles : normalStyles, widthStyle, className)}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
