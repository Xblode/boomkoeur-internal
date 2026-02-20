import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Label, Textarea } from '@/components/ui/atoms';

export const TextareaDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Textarea</h3>
      <Card>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea id="bio" placeholder="Racontez-nous votre histoire..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-bio">Désactivé</Label>
            <Textarea id="disabled-bio" disabled placeholder="Zone de texte désactivée" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="error-bio" className="text-red-500">Erreur</Label>
            <Textarea id="error-bio" error placeholder="Zone de texte avec erreur" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default TextareaDemo;
