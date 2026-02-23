'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Label optionnel au-dessus de l'input */
  label?: string;
  /** ID pour associer le label (généré automatiquement si non fourni) */
  id?: string;
  /** Variant: default = input visible stylé, hidden = input caché pour trigger personnalisé */
  variant?: 'default' | 'hidden';
  /** default = standard, sm = compact */
  size?: 'default' | 'sm';
  /** Pleine largeur */
  fullWidth?: boolean;
}

const fileInputBaseStyles =
  'text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * FileInput - Input type="file" avec style unifié
 *
 * Utilisé pour l'upload de fichiers (Import CSV, visuels campagne, etc.).
 * Variant "hidden" pour les zones drag-drop avec trigger personnalisé.
 */
export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      id: providedId,
      variant = 'default',
      size = 'default',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const id = providedId ?? React.useId();

    if (variant === 'hidden') {
      return (
        <input
          ref={ref}
          type="file"
          id={id}
          className={cn('hidden', className)}
          {...props}
        />
      );
    }

    const sizeStyles = size === 'sm' ? 'text-xs file:py-0.5 file:px-2 file:mr-2' : '';

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <Label htmlFor={id}>
            {label}
          </Label>
        )}
        <input
          ref={ref}
          type="file"
          id={id}
          className={cn(fileInputBaseStyles, sizeStyles, fullWidth && 'w-full', className)}
          {...props}
        />
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
