import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';

export default function ProfileSecuritePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Sécurité</h1>
        <p className="text-muted-foreground">
          Gérez votre mot de passe et la sécurité de votre compte.
        </p>
      </div>

      <Card
        variant="settings"
        title="Mot de passe"
        description="Gérez votre mot de passe et la sécurité de votre compte."
      >
        <CardContent className="p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            La gestion du mot de passe sera disponible prochainement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
