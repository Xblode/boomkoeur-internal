'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ToolbarContextType {
  toolbar: ReactNode | null
  setToolbar: (toolbar: ReactNode | null) => void
  hasSecondToolbar: boolean
  setHasSecondToolbar: (has: boolean) => void
  toolbarExtraLeft: number
  setToolbarExtraLeft: (offset: number) => void
}

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined)

/**
 * ToolbarProvider - Provider global pour gérer la toolbar du backend
 * 
 * Ce provider permet à n'importe quelle page backend de définir son contenu de toolbar
 * via le hook useToolbar. La toolbar sera affichée entre le Header et le contenu principal.
 * 
 * Usage dans une page :
 * ```tsx
 * const { setToolbar } = useToolbar()
 * 
 * useEffect(() => {
 *   setToolbar(<PageToolbar>Mon contenu</PageToolbar>)
 *   return () => setToolbar(null)
 * }, [setToolbar])
 * ```
 */
export function ToolbarProvider({ children }: { children: ReactNode }) {
  const [toolbar, setToolbar] = useState<ReactNode | null>(null)
  const [hasSecondToolbar, setHasSecondToolbar] = useState(false)
  const [toolbarExtraLeft, setToolbarExtraLeft] = useState(0)

  return (
    <ToolbarContext.Provider value={{ toolbar, setToolbar, hasSecondToolbar, setHasSecondToolbar, toolbarExtraLeft, setToolbarExtraLeft }}>
      {children}
    </ToolbarContext.Provider>
  )
}

/**
 * useToolbar - Hook pour accéder au contexte de la toolbar
 * 
 * @returns {ToolbarContextType} Le contexte contenant toolbar et setToolbar
 * @throws {Error} Si utilisé en dehors d'un ToolbarProvider
 */
export function useToolbar() {
  const context = useContext(ToolbarContext)
  if (context === undefined) {
    throw new Error('useToolbar must be used within a ToolbarProvider')
  }
  return context
}
