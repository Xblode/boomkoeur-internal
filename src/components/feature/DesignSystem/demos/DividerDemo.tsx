import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Divider } from '@/components/ui/atoms';

export const DividerDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Divider</h3>
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p>Contenu A</p>
            <Divider />
            <p>Contenu B</p>
          </div>
          <div>
            <Divider text="Ou continuer avec" />
          </div>
          <div className="flex h-5 items-center space-x-4 text-sm">
            <div>Blog</div>
            <Divider orientation="vertical" />
            <div>Docs</div>
            <Divider orientation="vertical" />
            <div>Source</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default DividerDemo;
