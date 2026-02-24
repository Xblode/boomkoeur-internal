'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InlineEditProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  placeholder?: string;
  /** title = titre principal (text-3xl bold), default = texte standard (text-sm), sm = compact (text-xs), table = cellule tableau */
  variant?: 'title' | 'default' | 'sm' | 'table';
  /** Afficher l'icône crayon au survol (défaut: true) */
  showEditIcon?: boolean;
  /** État éditing (affiche la bordure) — si non fourni, déduit du focus */
  editing?: boolean;
  /** Lecture seule (ex: cellule tableau non éditable) */
  readOnly?: boolean;
  className?: string;
}

const variantStyles = {
  title: 'text-3xl font-bold leading-tight placeholder:text-zinc-300 dark:placeholder:text-zinc-600',
  default: 'text-sm leading-normal placeholder:text-zinc-400',
  sm: 'text-xs leading-normal placeholder:text-zinc-400',
  table: 'text-xs leading-normal placeholder:text-zinc-400',
};

/**
 * InlineEdit — Édition inline (edit-in-place)
 *
 * Texte qui devient éditable au clic. Utilisé pour titres, noms, champs
 * dans les grilles de métadonnées (ex: EventInfoSection, MeetingInfoSection).
 *
 * - Survol : fond léger + icône crayon
 * - Clic : input avec bordure
 * - Enter : blur (déclenche onBlur)
 * - Escape : le parent gère l'annulation via onKeyDown
 */
export const InlineEdit = React.forwardRef<HTMLInputElement, InlineEditProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onKeyDown,
      onFocus,
      placeholder = 'Saisir...',
      variant = 'default',
      showEditIcon = true,
      editing,
      readOnly = false,
      className,
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);
    const isEditing = editing ?? focused;

    const isTable = variant === 'table';

    return (
      <div
        className={cn(
          'group transition-colors',
          readOnly ? 'cursor-default' : 'cursor-text',
          isTable ? 'flex w-full min-w-0 min-h-8 items-center rounded px-2 py-1' : 'rounded-lg p-1 -m-1',
          !isTable && 'inline-flex items-center gap-2',
          isTable
            ? 'border-0'
            : (isEditing
              ? 'border border-zinc-200 dark:border-zinc-800'
              : 'border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50'),
          className
        )}
      >
        <div
          className={cn(
            'inline-grid',
            variant === 'title' && 'leading-tight',
            isTable && 'min-w-0 w-full flex-1'
          )}
        >
          <span
            className={cn(
              'invisible col-start-1 row-start-1 whitespace-pre',
              variant === 'title' && 'leading-tight',
              variantStyles[variant]
            )}
          >
            {value || placeholder}
          </span>
          <input
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={() => {
              setFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setFocused(false);
              onBlur?.();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cn(
              'col-start-1 row-start-1 bg-transparent border-0 outline-none p-0 text-foreground',
              variantStyles[variant]
            )}
          />
        </div>
        {showEditIcon && !readOnly && (
          <Pencil
            size={variant === 'title' ? 16 : 14}
            className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0"
          />
        )}
      </div>
    );
  }
);

InlineEdit.displayName = 'InlineEdit';
