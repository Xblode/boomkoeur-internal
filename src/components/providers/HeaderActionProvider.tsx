'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderActionContextType {
  leftAction: ReactNode | null;
  setLeftAction: (action: ReactNode | null) => void;
}

const HeaderActionContext = createContext<HeaderActionContextType | undefined>(undefined);

export function HeaderActionProvider({ children }: { children: ReactNode }) {
  const [leftAction, setLeftAction] = useState<ReactNode | null>(null);
  return (
    <HeaderActionContext.Provider value={{ leftAction, setLeftAction }}>
      {children}
    </HeaderActionContext.Provider>
  );
}

export function useHeaderAction() {
  const context = useContext(HeaderActionContext);
  return context ?? { leftAction: null, setLeftAction: () => {} };
}
