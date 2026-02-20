import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Chip } from '@/components/ui/atoms';

export const ChipDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-semibold">Chip</h3>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Chip label="React" />
            <Chip label="Next.js" variant="outline" />
            <Chip label="Supprimable" onDelete={() => alert('Delete clicked')} />
            <Chip label="Typescript" variant="outline" onDelete={() => alert('Delete clicked')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ChipDemo;
