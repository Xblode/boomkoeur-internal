'use client'

import React, { ReactNode, Children, isValidElement, cloneElement } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/atoms'

export interface PageToolbarProps {
  /** Filtres, selects, etc. — affichés à gauche */
  filters?: ReactNode
  /** Boutons d'action — affichés à droite. Le dernier bouton (Button) est primary, les autres outline. */
  actions?: ReactNode
  /** Contenu libre (legacy) — utilise flex justify-between */
  children?: ReactNode
  /** Classe CSS personnalisée */
  className?: string
}

const TOOLBAR_BASE =
  'h-10 min-h-0 flex items-center p-0 px-4 border-b bg-backend text-foreground border-zinc-200 dark:border-zinc-800'

/**
 * PageToolbar - Barre d'outils pour les pages backend
 *
 * Layout : filtres/selects à gauche, boutons d'action à droite.
 * Le bouton le plus à droite doit être primary, les autres outline.
 *
 * @example
 * ```tsx
 * <PageToolbar
 *   filters={<PageToolbarFilters>...</PageToolbarFilters>}
 *   actions={<PageToolbarActions>...</PageToolbarActions>}
 * />
 * ```
 *
 * Ou avec children (legacy) :
 * ```tsx
 * <PageToolbar className="justify-between">
 *   <div>Filtres</div>
 *   <PageToolbarActions>
 *     <Button>Export</Button>
 *     <Button>Nouveau</Button>
 *   </PageToolbarActions>
 * </PageToolbar>
 * ```
 */
export function PageToolbar({ filters, actions, children, className }: PageToolbarProps) {
  if (filters != null || actions != null) {
    return (
      <div className={cn(TOOLBAR_BASE, 'flex flex-1 min-w-0 w-full justify-between', className)}>
        <div className="flex items-center gap-4 min-w-0 overflow-hidden">
          {filters}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 justify-end">
            {actions}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(TOOLBAR_BASE, className)}>
      {children}
    </div>
  )
}

/** Wrapper pour les filtres (selects, dropdowns, etc.) — à gauche de la toolbar */
export function PageToolbarFilters({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  )
}

/**
 * Wrapper pour les boutons d'action — à droite de la toolbar.
 * Applique automatiquement : dernier bouton = primary, autres = outline.
 */
export function PageToolbarActions({ children, className }: { children: ReactNode; className?: string }) {
  const count = Children.count(children)
  const processed = Children.map(children, (child, index) => {
    if (!isValidElement(child) || child.type !== Button) return child
    const isLast = index === count - 1
    return cloneElement(child as React.ReactElement<{ variant?: string; size?: string }>, {
      variant: isLast ? 'primary' : 'outline',
      size: 'xs',
    })
  })
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {processed}
    </div>
  )
}
