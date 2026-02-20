import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Icon } from '@/components/ui/atoms';
import { User, Settings, Mail, Bell, Search } from 'lucide-react';

export const IconDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Icon</h3>
      <Card>
        <CardContent className="flex flex-wrap gap-4">
          <Icon icon={User} size="md" />
          <Icon icon={Settings} size="md" />
          <Icon icon={Mail} size="md" />
          <Icon icon={Bell} size="md" />
          <Icon icon={Search} size="md" />
        </CardContent>
      </Card>
    </div>
  );
};
export default IconDemo;
