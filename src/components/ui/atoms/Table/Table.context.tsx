'use client';

import React, { createContext, useContext } from 'react';
import type { TableContextValue } from './Table.types';

const TableContext = createContext<TableContextValue | null>(null);

export function useTableContext() {
  const ctx = useContext(TableContext);
  return ctx;
}

export { TableContext };
