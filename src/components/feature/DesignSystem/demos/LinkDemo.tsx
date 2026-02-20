import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { CustomLink } from '@/components/ui/atoms';

export const LinkDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Link</h3>
      <Card>
        <CardContent className="space-y-4 flex flex-col items-start">
          <CustomLink href="#">Lien par défaut</CustomLink>
          <CustomLink href="#" variant="muted">Lien discret</CustomLink>
          <CustomLink href="#" variant="underline">Lien souligné</CustomLink>
          <CustomLink href="https://google.com" isExternal>Lien externe</CustomLink>
        </CardContent>
      </Card>
    </div>
  );
};
export default LinkDemo;
