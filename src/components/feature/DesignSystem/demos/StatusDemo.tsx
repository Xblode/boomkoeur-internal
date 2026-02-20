import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Tag, Dot } from '@/components/ui/atoms';

export const StatusDemo = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tag</h3>
        <Card>
          <CardContent className="flex flex-wrap gap-2">
            <Tag>Default</Tag>
            <Tag color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Blue</Tag>
            <Tag color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Green</Tag>
            <Tag color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Red</Tag>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Dot</h3>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Dot variant="neutral" /> Neutral
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="success" /> Success
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="warning" /> Warning
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="error" /> Error
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="success" animate /> Live
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default StatusDemo;
