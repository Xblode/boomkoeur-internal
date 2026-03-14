'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface MessagesDrawerContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MessagesDrawerContext = createContext<MessagesDrawerContextType | undefined>(undefined);

export function MessagesDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <MessagesDrawerContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MessagesDrawerContext.Provider>
  );
}

const noop = () => {};
const defaultContext: MessagesDrawerContextType = {
  isOpen: false,
  open: noop,
  close: noop,
  toggle: noop,
};

export function useMessagesDrawer() {
  const context = useContext(MessagesDrawerContext);
  return context ?? defaultContext;
}
