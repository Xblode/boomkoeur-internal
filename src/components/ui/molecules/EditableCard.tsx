'use client';

import React, { type ReactNode } from 'react';
import { Edit, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/atoms';
import { Card } from './Card';

export interface EditableCardProps {
  isEditing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
  onDelete?: () => void;
  headerContent: ReactNode;
  editContent: ReactNode;
  headerPadding?: 'sm' | 'md';
  className?: string;
}

/**
 * EditableCard - Carte éditable avec zone déroulante
 *
 * Utilise Card variant="editable" (thème). Structure : header (toujours visible) + zone d'édition (déroule en dessous au clic Éditer).
 * Actions Éditer/Supprimer visibles au hover, bouton X quand en édition.
 */
export function EditableCard({
  isEditing,
  onEdit,
  onCloseEdit,
  onDelete,
  headerContent,
  editContent,
  headerPadding = 'md',
  className,
}: EditableCardProps) {
  const paddingClass = headerPadding === 'sm' ? 'p-3' : 'p-4';

  return (
    <Card variant="editable" className={cn('group/card', className)}>
      <div className={paddingClass}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">{headerContent}</div>
          {isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onCloseEdit}
              className="shrink-0 h-6 w-6 p-0 md:h-7 md:w-7"
              aria-label="Fermer"
            >
              <X size={12} />
            </Button>
          ) : (
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" onClick={onEdit} className="h-7 text-xs px-2">
                <Edit size={12} /> Éditer
              </Button>
              {onDelete && (
                <IconButton
                  type="button"
                  icon={<Trash2 size={12} />}
                  ariaLabel="Supprimer"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="border-t-2 border-dashed border-border-custom p-4 space-y-4 bg-card-bg">
          {editContent}
        </div>
      )}
    </Card>
  );
}
