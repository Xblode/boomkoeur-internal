import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Slider } from '@/components/ui/atoms';

export const SliderDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Slider</h3>
      <Card>
        <CardContent className="space-y-4 max-w-sm">
          <Slider defaultValue={50} />
          <Slider defaultValue={25} disabled />
        </CardContent>
      </Card>
    </div>
  );
};
export default SliderDemo;
