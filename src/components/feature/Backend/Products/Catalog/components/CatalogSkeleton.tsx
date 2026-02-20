'use client';

import ProductCardSkeleton from './ProductCardSkeleton';

interface CatalogSkeletonProps {
  count?: number;
}

export default function CatalogSkeleton({ count = 8 }: CatalogSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
