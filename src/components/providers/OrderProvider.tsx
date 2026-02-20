'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface OrderContextValue {
  refreshTrigger: number;
  triggerRefresh: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  
  return (
    <OrderContext.Provider value={{ refreshTrigger, triggerRefresh, isLoading, setIsLoading }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
