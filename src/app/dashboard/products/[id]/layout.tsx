'use client';

import { useEffect, use } from 'react';
import { ProductProvider } from '@/components/providers';
import { initializeProductsDemoData } from '@/lib/mocks/products/demoData';
import { initializeOrdersDemoData } from '@/lib/mocks/orders/demoData';
import { ProductDetailLayoutConfig } from '@/components/feature/Backend/Products/ProductDetailLayoutConfig';

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
      <ProductDetailLayoutConfig productId={id}>{children}</ProductDetailLayoutConfig>
    </ProductProvider>
  );
}
