'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';

export type PageAlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface PageAlertProps {
  variant: PageAlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<PageAlertVariant, string> = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
};

const variantIcons: Record<PageAlertVariant, React.ReactNode> = {
  info: <Info size={18} className="shrink-0" />,
  warning: <AlertTriangle size={18} className="shrink-0" />,
  error: <AlertCircle size={18} className="shrink-0" />,
  success: <CheckCircle size={18} className="shrink-0" />,
};

/**
 * PageAlert - Zone d'alerte affichée au-dessus de la toolbar
 *
 * Utilisé pour les messages contextuels de page (info, warning, error, success).
 * S'affiche dans le bloc sticky avec la toolbar.
 */
export function PageAlert({ variant, message, onDismiss, className }: PageAlertProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b',
        variantStyles[variant],
        className
      )}
    >
      {variantIcons[variant]}
      <span className="text-sm font-medium flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
