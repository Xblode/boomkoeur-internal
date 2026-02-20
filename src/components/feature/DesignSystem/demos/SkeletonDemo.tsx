import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Skeleton } from '@/components/ui/atoms';

export const SkeletonDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Skeleton</h3>
      <Card>
        <CardContent className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default SkeletonDemo;
