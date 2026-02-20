import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Radio, Label } from '@/components/ui/atoms';

export const RadioDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Radio</h3>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Plan de paiement</Label>
            <div className="flex items-center space-x-2">
              <Radio id="monthly" name="plan" value="monthly" defaultChecked />
              <Label htmlFor="monthly" className="font-normal cursor-pointer">Mensuel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Radio id="yearly" name="plan" value="yearly" />
              <Label htmlFor="yearly" className="font-normal cursor-pointer">Annuel</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default RadioDemo;
