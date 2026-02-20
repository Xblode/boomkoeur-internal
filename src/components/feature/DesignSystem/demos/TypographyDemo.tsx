import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Heading, Text } from '@/components/ui/atoms';

export const TypographyDemo = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Typography</h3>
      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Heading level={1}>Heading 1</Heading>
            <Heading level={2}>Heading 2</Heading>
            <Heading level={3}>Heading 3</Heading>
            <Heading level={4}>Heading 4</Heading>
          </div>
          <div className="space-y-2">
            <Text variant="lead">Ceci est un paragraphe d'introduction (Lead).</Text>
            <Text>Ceci est un paragraphe standard avec une bonne lisibilité pour le corps de texte.</Text>
            <Text variant="large">Texte large et en gras.</Text>
            <Text variant="small">Petit texte (légendes, etc).</Text>
            <Text variant="muted">Texte muet (gris).</Text>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default TypographyDemo;
