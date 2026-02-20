'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/molecules';
import { Button, Input, Label } from '@/components/ui/atoms';

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
          title="Informations générales"
          description="Paramètres globaux du site."
        >
          <CardContent className="p-0 divide-y divide-border-custom">

            <div className="flex flex-col md:flex-row gap-4 p-4">
              <div className="w-full md:w-1/3 space-y-1">
                <Label htmlFor="siteName" className="text-base font-medium">Nom du site</Label>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Le nom qui apparaîtra dans l&apos;onglet du navigateur.
                </p>
              </div>
              <div className="w-full md:w-2/3 flex justify-end">
                <Input
                  id="siteName"
                  className="max-w-md"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="Nom de votre site"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 p-4">
              <div className="w-full md:w-1/3 space-y-1">
                <Label htmlFor="siteDescription" className="text-base font-medium">Description</Label>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Courte description utilisée pour le SEO.
                </p>
              </div>
              <div className="w-full md:w-2/3 flex justify-end">
                <Input
                  id="siteDescription"
                  className="max-w-md"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="Description de votre site"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 p-4">
              <div className="w-full md:w-1/3 space-y-1">
                <Label htmlFor="adminEmail" className="text-base font-medium">Email administrateur</Label>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Utilisé pour les notifications système.
                </p>
              </div>
              <div className="w-full md:w-2/3 flex justify-end">
                <Input
                  id="adminEmail"
                  type="email"
                  className="max-w-md"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

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
