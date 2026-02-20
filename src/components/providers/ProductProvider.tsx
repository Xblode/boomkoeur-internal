'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ProductContextValue {
  refreshTrigger: number;
  triggerRefresh: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  
  return (
    <ProductContext.Provider value={{ refreshTrigger, triggerRefresh, isLoading, setIsLoading }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}
