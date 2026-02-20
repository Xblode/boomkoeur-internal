import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Switch, Label } from '@/components/ui/atoms';

export const SwitchDemo = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Switch</h3>
      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between max-w-xs">
            <Label htmlFor="airplane-mode" className="cursor-pointer">Mode avion</Label>
            <Switch id="airplane-mode" checked={checked} onCheckedChange={setChecked} />
          </div>
          <div className="flex items-center justify-between max-w-xs">
            <Label htmlFor="disabled-switch" className="text-zinc-400">Bluetooth (Désactivé)</Label>
            <Switch id="disabled-switch" disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default SwitchDemo;
