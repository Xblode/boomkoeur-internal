import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Label, Select } from '@/components/ui/atoms';

export const SelectDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Select</h3>
      <Card>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Select id="framework">
              <option value="">Sélectionner un framework</option>
              <option value="next">Next.js</option>
              <option value="react">React</option>
              <option value="vue">Vue</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-select">Désactivé</Label>
            <Select id="disabled-select" disabled>
              <option>Option désactivée</option>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default SelectDemo;
