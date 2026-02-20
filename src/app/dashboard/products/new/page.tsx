'use client';

import { useEffect } from 'react';
import { ProductProvider } from '@/components/providers';
import { initializeProductsDemoData } from '@/lib/mocks/products/demoData';
import { ProductCreatePage } from '@/components/feature/Backend/Products/ProductCreatePage';

export default function NewProductPage() {
  useEffect(() => {
    initializeProductsDemoData();
  }, []);

  return (
    <ProductProvider>
      <ProductCreatePage />
    </ProductProvider>
  );
}
