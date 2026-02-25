'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface DetailPanelConfig {
  title?: string;
  content: ReactNode;
  onClose: () => void;
}

interface DetailPanelContextType {
  config: DetailPanelConfig | null;
  setDetailPanel: (config: DetailPanelConfig | null) => void;
}

const DetailPanelContext = createContext<DetailPanelContextType | undefined>(undefined);

/**
 * DetailPanelProvider - Panneau latéral droit pour afficher le détail d'une entité.
 * Utilisé par les pages pour ouvrir un panneau d'édition (ex: transaction).
 */
export function DetailPanelProvider({ children }: { children: ReactNode }) {
  const [config, setDetailPanel] = useState<DetailPanelConfig | null>(null);

  return (
    <DetailPanelContext.Provider value={{ config, setDetailPanel }}>
      {children}
    </DetailPanelContext.Provider>
  );
}

export function useDetailPanel() {
  const context = useContext(DetailPanelContext);
  if (context === undefined) {
    throw new Error('useDetailPanel must be used within a DetailPanelProvider');
  }
  return context;
}
