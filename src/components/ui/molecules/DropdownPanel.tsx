'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DropdownPanelProps {
  /** Position du panneau (ex: depuis getBoundingClientRect) */
  style?: React.CSSProperties;
  /** Contenu du panneau */
  children: React.ReactNode;
  /** Classes additionnelles pour la taille (min-w, max-w, max-h, p-4, etc.) */
  className?: string;
  /** Attributs data-* (ex: data-filter-dropdown) */
  'data-filter-dropdown'?: boolean;
}

const baseClasses =
  'fixed z-[var(--z-dropdown-panel)] bg-card-bg border border-border-custom rounded shadow-lg';

/**
 * Panneau dropdown réutilisable pour menus, filtres, etc.
 * Utilise Framer Motion pour l'animation d'entrée/sortie.
 */
export function DropdownPanel({
  style,
  children,
  className,
  'data-filter-dropdown': dataFilterDropdown,
}: DropdownPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={cn(baseClasses, className)}
      style={style}
      onClick={(e) => e.stopPropagation()}
      data-filter-dropdown={dataFilterDropdown}
    >
      {children}
    </motion.div>
  );
}
