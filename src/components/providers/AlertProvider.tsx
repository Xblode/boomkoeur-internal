'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PageAlertVariant } from '@/components/ui/molecules/PageAlert';

export interface AlertData {
  variant: PageAlertVariant;
  message: string;
  onDismiss?: () => void;
}

interface AlertContextType {
  alert: AlertData | null;
  setAlert: (alert: AlertData | null) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * AlertProvider - Slot alerte toujours actif.
 * La page fournit le contenu via setAlert. Quand null, le slot reste présent mais vide.
 */
export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertData | null>(null);

  return (
    <AlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
