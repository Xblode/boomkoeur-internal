'use client';

import { useEffect } from 'react';
import { use } from 'react';
import { ProductProvider } from '@/components/providers';
import { initializeProductsDemoData } from '@/lib/mocks/products/demoData';
import { initializeOrdersDemoData } from '@/lib/mocks/orders/demoData';
import { ProductDetailLayout } from '@/components/feature/Backend/Products/ProductDetailLayout';

interface ProductDetailLayoutRouteProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default function ProductDetailLayoutRoute({ children, params }: ProductDetailLayoutRouteProps) {
  const { id } = use(params);

  useEffect(() => {
    initializeProductsDemoData();
    initializeOrdersDemoData();
  }, []);

  return (
    <ProductProvider>
      <ProductDetailLayout productId={id}>{children}</ProductDetailLayout>
    </ProductProvider>
  );
}
