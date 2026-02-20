import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Rating } from '@/components/ui/atoms';

export const RatingDemo = () => {
  const [value, setValue] = useState(3);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Rating</h3>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Interactif (Valeur: {value})</span>
            <Rating value={value} onChange={setValue} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Lecture seule</span>
            <Rating value={4} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default RatingDemo;
