import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Spinner } from '@/components/ui/atoms';

export const SpinnerDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Spinner</h3>
      <Card>
        <CardContent className="flex items-center gap-8">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </CardContent>
      </Card>
    </div>
  );
};
export default SpinnerDemo;
