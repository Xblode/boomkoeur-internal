'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface MessagesDrawerContextType {
  isOpen: boolean;
  /** True pendant la transition de fermeture — permet de fermer overlays/popovers avant unmount */
  isClosing: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MessagesDrawerContext = createContext<MessagesDrawerContextType | undefined>(undefined);

export function MessagesDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsClosing(true);
    // Délai pour permettre aux overlays (MessageMobileOverlay) et popovers de se fermer
    // avant l'unmount du drawer — évite l'erreur "removeChild" sur null
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(false);
        setIsClosing(false);
      });
    });
  }, []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <MessagesDrawerContext.Provider value={{ isOpen, isClosing, open, close, toggle }}>
      {children}
    </MessagesDrawerContext.Provider>
  );
}

const noop = () => {};
const defaultContext: MessagesDrawerContextType = {
  isOpen: false,
  isClosing: false,
  open: noop,
  close: noop,
  toggle: noop,
};

export function useMessagesDrawer() {
  const context = useContext(MessagesDrawerContext);
  return context ?? defaultContext;
}
