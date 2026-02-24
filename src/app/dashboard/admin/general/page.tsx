'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, SettingsCardRow } from '@/components/ui/molecules';
import { Button, IconButton, Input, Select } from '@/components/ui/atoms';
import { useOrg } from '@/hooks';
import { Copy } from 'lucide-react';
import { updateOrganisation, deleteOrganisation } from '@/lib/supabase/organisations';
import { getErrorMessage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { OrgType } from '@/types/organisation';

export default function AdminGeneralPage() {
  const { activeOrg, refreshOrgs, isFounder } = useOrg();
  const router = useRouter();

  const [settings, setSettings] = useState({
    name: '',
    description: '',
    type: 'association' as OrgType,
    logo: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      setSettings({
        name: activeOrg.name,
        description: activeOrg.description ?? '',
        type: activeOrg.type,
        logo: activeOrg.logo ?? '',
      });
    }
  }, [activeOrg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setIsSaving(true);

    try {
      await updateOrganisation(activeOrg.id, {
        name: settings.name,
        description: settings.description || undefined,
        type: settings.type,
        logo: settings.logo || undefined,
      });
      await refreshOrgs();
      toast.success('Organisation mise a jour', {
        description: 'Les informations ont ete enregistrees avec succes.',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeOrg) return;
    if (!confirm(`Supprimer definitivement l'organisation "${activeOrg.name}" ? Cette action est irreversible.`)) return;

    try {
      await deleteOrganisation(activeOrg.id);
      localStorage.removeItem('active_org_id');
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!activeOrg) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Aucune organisation selectionnee.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">General</h1>
        <p className="text-muted-foreground">
          Configurez les informations de votre organisation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          variant="settings"
          title="Informations de l'organisation"
          description="Parametres de l'espace de travail actif."
        >
          <CardContent className="p-0 divide-y divide-border-custom">
            <SettingsCardRow
              label="Nom"
              description="Le nom de votre organisation."
              htmlFor="orgName"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="orgName"
                className="max-w-md"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Nom de l'organisation"
                required
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Description"
              description="Courte description de l'organisation."
              htmlFor="orgDescription"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="orgDescription"
                className="max-w-md"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Description"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Type"
              description="Le type de structure."
              htmlFor="orgType"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Select
                id="orgType"
                className="max-w-md"
                value={settings.type}
                onChange={(e) => setSettings({ ...settings, type: e.target.value as OrgType })}
                options={[
                  { value: 'association', label: 'Association' },
                  { value: 'entreprise', label: 'Entreprise' },
                  { value: 'collectif', label: 'Collectif' },
                  { value: 'autre', label: 'Autre' },
                ]}
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Logo (URL)"
              description="URL vers le logo de l'organisation."
              htmlFor="orgLogo"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="orgLogo"
                type="url"
                className="max-w-md"
                value={settings.logo}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="ID de l'organisation"
              description="Identifiant technique (UUID) pour les intégrations et l'API."
              controlClassName="w-full md:w-2/3 flex justify-end items-center gap-2"
            >
              <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-[280px]">
                {activeOrg.id}
              </div>
              <IconButton
                variant="ghost"
                size="sm"
                icon={<Copy size={16} />}
                ariaLabel="Copier l'ID"
                onClick={() => {
                  navigator.clipboard.writeText(activeOrg.id);
                  toast.success('ID copié dans le presse-papier');
                }}
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Slug"
              description="Identifiant unique de l'organisation."
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                {activeOrg.slug}
              </div>
            </SettingsCardRow>
          </CardContent>

          <CardFooter className="border-t border-border-custom p-4 flex justify-end gap-3 rounded-b-md">
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              if (activeOrg) setSettings({
                name: activeOrg.name,
                description: activeOrg.description ?? '',
                type: activeOrg.type,
                logo: activeOrg.logo ?? '',
              });
            }}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {isFounder && (
        <Card variant="settings" title="Zone de danger" description="Actions irreversibles.">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Supprimer l'organisation</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Supprime definitivement l'organisation et toutes ses donnees.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30">
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
