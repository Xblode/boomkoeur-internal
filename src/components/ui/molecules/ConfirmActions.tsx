'use client';

import React from 'react';
import { Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

export interface ConfirmActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Désactiver le bouton OK */
  disabled?: boolean;
  /** Afficher un état de chargement sur OK */
  loading?: boolean;
  /** Variant compact pour popovers inline (text-[10px]) */
  compact?: boolean;
  /** Style pour overlay sombre (ex: fond bg-zinc-900/90) */
  overlay?: boolean;
  className?: string;
}

/**
 * ConfirmActions - Groupe OK / Annuler pour popovers inline
 *
 * Utilisé dans les overlays d'édition (ex: EventCampaignSection visuels).
 * Variant compact pour les zones à espace limité.
 */
export function ConfirmActions({
  onConfirm,
  onCancel,
  confirmLabel = 'OK',
  cancelLabel = '✕',
  disabled = false,
  loading = false,
  compact = false,
  overlay = false,
  className,
}: ConfirmActionsProps) {
  const overlayConfirmClass = overlay && '!bg-white !text-zinc-900 hover:!bg-zinc-100';
  const overlayCancelClass = overlay && '!bg-zinc-700 !text-white hover:!bg-zinc-600';

  return (
    <div className={cn('flex gap-1 w-full', className)}>
      <Button
        type="button"
        variant="primary"
        size={compact ? 'xs' : 'sm'}
        onClick={onConfirm}
        disabled={disabled}
        loading={loading}
        className={cn(compact && 'flex-1 text-[10px] font-medium py-0.5', overlayConfirmClass)}
      >
        {confirmLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={compact ? 'xs' : 'sm'}
        onClick={onCancel}
        disabled={loading}
        className={cn(compact && 'flex-1 text-[10px] font-medium py-0.5', overlayCancelClass)}
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
