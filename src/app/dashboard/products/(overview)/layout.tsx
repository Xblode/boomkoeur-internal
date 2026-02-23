'use client';

import { ProductProvider, OrderProvider } from '@/components/providers';
import { useEffect } from 'react';
import { initializeProductsDemoData } from '@/lib/mocks/products/demoData';
import { initializeOrdersDemoData } from '@/lib/mocks/orders/demoData';
import { ProductsLayoutConfig } from '@/components/feature/Backend/Products/ProductsLayoutConfig';

export default function ProductsOverviewRoute({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeProductsDemoData();
    initializeOrdersDemoData();
  }, []);

  return (
    <ProductProvider>
      <OrderProvider>
        <ProductsLayoutConfig>{children}</ProductsLayoutConfig>
      </OrderProvider>
    </ProductProvider>
  );
}
