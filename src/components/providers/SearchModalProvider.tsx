'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface SearchModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined);

export function SearchModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <SearchModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SearchModalContext.Provider>
  );
}

const noop = () => {};
const defaultContext: SearchModalContextType = {
  isOpen: false,
  open: noop,
  close: noop,
  toggle: noop,
};

export function useSearchModal() {
  const context = useContext(SearchModalContext);
  return context ?? defaultContext;
}
