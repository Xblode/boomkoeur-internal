'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface MobileNavContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <MobileNavContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileNavContext.Provider>
  );
}

const noop = () => {};
const defaultContext: MobileNavContextType = {
  isOpen: false,
  open: noop,
  close: noop,
  toggle: noop,
};

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  return context ?? defaultContext;
}
