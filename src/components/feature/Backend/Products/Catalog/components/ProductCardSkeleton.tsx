'use client';

import { Card, CardContent } from '@/components/ui/molecules/Card';

export default function ProductCardSkeleton() {
  return (
    <Card variant="list" className="overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      
      {/* Content Skeleton */}
      <CardContent className="p-4 space-y-3">
        {/* SKU & Status */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse" />
        </div>
        
        {/* Name */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>
        
        {/* Badges */}
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>
        
        {/* Stock */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
