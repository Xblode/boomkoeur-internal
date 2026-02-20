import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Progress } from '@/components/ui/atoms';

export const ProgressDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Progress</h3>
      <Card>
        <CardContent className="space-y-4 max-w-md">
          <Progress value={33} />
          <Progress value={66} />
          <Progress value={90} className="h-4" indicatorClassName="bg-green-500" />
        </CardContent>
      </Card>
    </div>
  );
};
export default ProgressDemo;
