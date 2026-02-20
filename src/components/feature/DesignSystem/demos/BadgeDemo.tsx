import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Badge } from '@/components/ui/atoms';

export const BadgeDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-semibold">Badge</h3>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default BadgeDemo;
