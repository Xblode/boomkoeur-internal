import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Checkbox, Label } from '@/components/ui/atoms';

export const CheckboxDemo = () => {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xl font-semibold">Checkbox</h3>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="cursor-pointer">J'accepte les conditions d'utilisation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-check" disabled defaultChecked />
            <Label htmlFor="disabled-check" className="text-zinc-400">Option désactivée</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default CheckboxDemo;
