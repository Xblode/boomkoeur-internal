import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Label } from '@/components/ui/atoms';

export const LabelDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Label</h3>
      <Card>
        <CardContent>
          <Label>Ceci est un label standard</Label>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelDemo;
