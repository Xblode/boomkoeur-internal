'use client';

import { ProductProvider, OrderProvider } from '@/components/providers';
import { useEffect } from 'react';
import { initializeProductsDemoData } from '@/lib/mocks/products/demoData';
import { initializeOrdersDemoData } from '@/lib/mocks/orders/demoData';
import { ProductsOverviewLayout } from '@/components/feature/Backend/Products/ProductsOverviewLayout';

export default function ProductsOverviewRoute({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeProductsDemoData();
    initializeOrdersDemoData();
  }, []);

  return (
    <ProductProvider>
      <OrderProvider>
        <ProductsOverviewLayout>{children}</ProductsOverviewLayout>
      </OrderProvider>
    </ProductProvider>
  );
}
