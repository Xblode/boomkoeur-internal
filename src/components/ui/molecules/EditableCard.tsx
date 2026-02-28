'use client';

import React, { type ReactNode } from 'react';
import { X, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/atoms';
import { Card } from './Card';

export interface EditableCardProps {
  isEditing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
  onDelete?: (e?: React.MouseEvent) => void;
  headerContent: ReactNode;
  editContent: ReactNode;
  headerPadding?: 'sm' | 'md';
  /** default = Card pleine + actions Éditer/Supprimer | outline = Card transparente + actions dans headerContent */
  variant?: 'default' | 'outline';
  /** Si false, la carte n'est pas éditable (clic désactivé). Défaut: true */
  editable?: boolean;
  className?: string;
}

/**
 * EditableCard - Carte éditable avec zone déroulante
 *
 * - variant="default" : Card pleine, actions Éditer/Supprimer au hover
 * - variant="outline" : Card transparente, actions personnalisées dans headerContent (ex: Paramètres)
 */
export function EditableCard({
  isEditing,
  onEdit,
  onCloseEdit,
  onDelete,
  headerContent,
  editContent,
  headerPadding = 'md',
  variant = 'default',
  editable = true,
  className,
}: EditableCardProps) {
  const paddingClass = headerPadding === 'sm' ? 'p-3' : 'p-4';
  const cardVariant = variant === 'outline' ? 'outline' : 'default';
  const showDefaultActions = variant === 'default';
  const canEdit = showDefaultActions && editable && !isEditing;

  return (
    <Card variant={cardVariant} className={cn('group/card overflow-hidden', className)}>
      <div
        className={cn(paddingClass, 'relative')}
        onClick={canEdit ? onEdit : undefined}
        onKeyDown={canEdit ? (e) => e.key === 'Enter' && onEdit() : undefined}
        role={canEdit ? 'button' : undefined}
        tabIndex={canEdit ? 0 : undefined}
      >
        <div className={cn('flex items-start w-full', showDefaultActions ? 'gap-3' : 'gap-2')}>
          <div
            className={cn(
              'flex min-w-0 flex-1 overflow-hidden gap-3',
              canEdit && 'cursor-pointer',
              showDefaultActions && '[&>*:first-child]:!h-10 [&>*:first-child]:!w-10 [&>*:first-child]:!shrink-0',
              !showDefaultActions && 'flex-1'
            )}
          >
            {headerContent}
          </div>
        </div>
        {showDefaultActions && (
          <div className="absolute top-0 right-0 bottom-0 flex items-center justify-end gap-2 pr-6 pl-12 pointer-events-none [&>*]:pointer-events-auto">
            {isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onCloseEdit}
                className="shrink-0 h-8 w-8 p-0"
                aria-label="Fermer"
              >
                <X size={14} />
              </Button>
            ) : (
              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                {editable && (
                  <IconButton
                    type="button"
                    icon={<Pencil size={14} />}
                    ariaLabel="Modifier"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="shrink-0 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                  />
                )}
                {onDelete && (
                  <IconButton
                    type="button"
                    icon={<Trash2 size={14} />}
                    ariaLabel="Supprimer"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(e);
                    }}
                    className="shrink-0 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div
          className={cn(
            'border-t-2 border-dashed border-border-custom p-4 space-y-4',
            cardVariant === 'outline' ? 'bg-transparent' : 'bg-card-bg'
          )}
        >
          {editContent}
        </div>
      )}
    </Card>
  );
}
