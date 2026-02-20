import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { IconButton } from '@/components/ui/atoms';
import { Plus, Trash, Edit } from 'lucide-react';

export const IconButtonDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">IconButton</h3>
      <Card>
        <CardContent className="flex items-center gap-4">
          <IconButton icon={<Plus />} size="sm" variant="outline" ariaLabel="Ajouter" />
          <IconButton icon={<Edit />} size="md" variant="secondary" ariaLabel="Modifier" />
          <IconButton icon={<Trash />} size="lg" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" ariaLabel="Supprimer" />
        </CardContent>
      </Card>
    </div>
  );
};
export default IconButtonDemo;
