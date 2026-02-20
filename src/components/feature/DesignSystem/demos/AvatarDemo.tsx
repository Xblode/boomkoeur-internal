import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Avatar } from '@/components/ui/atoms';

export const AvatarDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-semibold">Avatar</h3>
      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-500">Small</span>
              <Avatar size="sm" fallback="SM" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-500">Medium</span>
              <Avatar size="md" fallback="MD" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-500">Large</span>
              <Avatar size="lg" fallback="LG" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar src="https://github.com/shadcn.png" alt="@shadcn" size="md" />
            <Avatar fallback="JD" size="md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default AvatarDemo;
