'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, SettingsCardRow } from '@/components/ui/molecules';
import { Button, Input } from '@/components/ui/atoms';

export default function AdminGeneralPage() {
  const [settings, setSettings] = useState({
    siteName: 'Template V1',
    siteDescription: 'Un template Next.js moderne',
    adminEmail: 'admin@example.com',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings saved:', settings);
    toast.success('Paramètres sauvegardés avec succès !', {
      description: 'Les informations du site ont été mises à jour.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Général</h1>
        <p className="text-muted-foreground">
          Configurez les informations principales de votre site.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          variant="settings"
          title="Informations générales"
          description="Paramètres globaux du site."
        >
          <CardContent className="p-0 divide-y divide-border-custom">

            <SettingsCardRow
              label="Nom du site"
              description="Le nom qui apparaîtra dans l'onglet du navigateur."
              htmlFor="siteName"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="siteName"
                className="max-w-md"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Nom de votre site"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Description"
              description="Courte description utilisée pour le SEO."
              htmlFor="siteDescription"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="siteDescription"
                className="max-w-md"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                placeholder="Description de votre site"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Email administrateur"
              description="Utilisé pour les notifications système."
              htmlFor="adminEmail"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="adminEmail"
                type="email"
                className="max-w-md"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="admin@example.com"
              />
            </SettingsCardRow>

          </CardContent>

          <CardFooter className="border-t border-border-custom p-4 flex justify-end gap-3 rounded-b-md">
            <Button type="button" variant="ghost" size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Sauvegarder
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
