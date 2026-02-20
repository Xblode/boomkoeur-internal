'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageToolbarProps {
  /** Contenu à afficher (boutons, actions, etc.) */
  children?: ReactNode
  /** Classe CSS personnalisée */
  className?: string
}

/**
 * PageToolbar - Composant de toolbar pour les pages backend
 * 
 * Affiche une barre horizontale fixe sous le header avec des actions/filtres.
 * Utilisé avec le ToolbarProvider pour injecter du contenu dynamiquement.
 * 
 * @example
 * ```tsx
 * <PageToolbar className="justify-between">
 *   <div>Filtres</div>
 *   <div>Actions</div>
 * </PageToolbar>
 * ```
 */
export function PageToolbar({ children, className }: PageToolbarProps) {
  // Si justify-between est dans le className, on ne wrappe pas les children
  const useWrapper = !className?.includes('justify-between')
  
  return (
    <div
      className={cn(
        'h-10 min-h-0 flex items-center justify-end p-0 px-4 border-b bg-[#171717] text-foreground',
        'border-zinc-200 dark:border-zinc-800',
        className
      )}
    >
      {children && (useWrapper ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {children}
        </div>
      ) : (
        children
      ))}
    </div>
  )
}
