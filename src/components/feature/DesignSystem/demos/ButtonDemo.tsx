import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';

export const ButtonDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-semibold">Button</h3>
      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ButtonDemo;
