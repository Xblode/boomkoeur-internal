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
    legalActivitePrincipale: '',
    legalCategorieJuridique: '',
    legalSlogan: '',
    legalTrancheEffectif: '',
    legalTrancheEffectifAnnee: '' as string | number,
    legalCategorieEntreprise: '',
    legalCategorieEntrepriseAnnee: '' as string | number,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      setSettings({
        name: activeOrg.name,
        description: activeOrg.description ?? '',
        type: activeOrg.type,
        logo: activeOrg.logo ?? '',
        legalActivitePrincipale: activeOrg.legalActivitePrincipale ?? '',
        legalCategorieJuridique: activeOrg.legalCategorieJuridique ?? '',
        legalSlogan: activeOrg.legalSlogan ?? '',
        legalTrancheEffectif: activeOrg.legalTrancheEffectif ?? '',
        legalTrancheEffectifAnnee: activeOrg.legalTrancheEffectifAnnee ?? '',
        legalCategorieEntreprise: activeOrg.legalCategorieEntreprise ?? '',
        legalCategorieEntrepriseAnnee: activeOrg.legalCategorieEntrepriseAnnee ?? '',
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
        legalActivitePrincipale: settings.legalActivitePrincipale || null,
        legalCategorieJuridique: settings.legalCategorieJuridique || null,
        legalSlogan: settings.legalSlogan || null,
        legalTrancheEffectif: settings.legalTrancheEffectif || null,
        legalTrancheEffectifAnnee: settings.legalTrancheEffectifAnnee ? Number(settings.legalTrancheEffectifAnnee) : null,
        legalCategorieEntreprise: settings.legalCategorieEntreprise || null,
        legalCategorieEntrepriseAnnee: settings.legalCategorieEntrepriseAnnee ? Number(settings.legalCategorieEntrepriseAnnee) : null,
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
              controlClassName="w-full min-w-0 md:max-w-md"
            >
              <Select
                id="orgType"
                className="w-full"
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
                legalActivitePrincipale: activeOrg.legalActivitePrincipale ?? '',
                legalCategorieJuridique: activeOrg.legalCategorieJuridique ?? '',
                legalSlogan: activeOrg.legalSlogan ?? '',
                legalTrancheEffectif: activeOrg.legalTrancheEffectif ?? '',
                legalTrancheEffectifAnnee: activeOrg.legalTrancheEffectifAnnee ?? '',
                legalCategorieEntreprise: activeOrg.legalCategorieEntreprise ?? '',
                legalCategorieEntrepriseAnnee: activeOrg.legalCategorieEntrepriseAnnee ?? '',
              });
            }}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </CardFooter>
        </Card>
      {activeOrg.type === 'association' && (
        <Card
          variant="settings"
          className="mt-6"
          title="Informations légales"
          description="Données extraites des statuts et informations complémentaires."
        >
          <CardContent className="p-0 divide-y divide-border-custom">
            <SettingsCardRow
              label="Siège social"
              description="Adresse du siège de l'association."
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <div className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md text-right">
                {activeOrg.legalSiege || <span className="italic text-zinc-400">Non renseigné</span>}
              </div>
            </SettingsCardRow>

            <SettingsCardRow
              label="Numéro RNA"
              description="Répertoire National des Associations."
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <div className="text-sm text-zinc-600 dark:text-zinc-400 font-mono max-w-md text-right">
                {activeOrg.legalRna || <span className="italic text-zinc-400 font-sans">Non renseigné</span>}
              </div>
            </SettingsCardRow>

            <SettingsCardRow
              label="SIRET"
              description="Numéro d'identification."
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <div className="text-sm text-zinc-600 dark:text-zinc-400 font-mono max-w-md text-right">
                {activeOrg.legalSiret || <span className="italic text-zinc-400 font-sans">Non renseigné</span>}
              </div>
            </SettingsCardRow>

            <SettingsCardRow
              label="Activité principale exercée"
              description="Activité principale de l'organisation."
              htmlFor="legalActivitePrincipale"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="legalActivitePrincipale"
                className="max-w-md"
                value={settings.legalActivitePrincipale}
                onChange={(e) => setSettings({ ...settings, legalActivitePrincipale: e.target.value })}
                placeholder="Ex. : organisation d'événements culturels"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Catégorie juridique"
              description="Forme juridique de l'organisation."
              htmlFor="legalCategorieJuridique"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="legalCategorieJuridique"
                className="max-w-md"
                value={settings.legalCategorieJuridique}
                onChange={(e) => setSettings({ ...settings, legalCategorieJuridique: e.target.value })}
                placeholder="Ex. : Association loi 1901"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Slogan"
              description="Slogan ou devise de l'organisation."
              htmlFor="legalSlogan"
              controlClassName="w-full md:w-2/3 flex justify-end"
            >
              <Input
                id="legalSlogan"
                className="max-w-md"
                value={settings.legalSlogan}
                onChange={(e) => setSettings({ ...settings, legalSlogan: e.target.value })}
                placeholder="Ex. : Ensemble pour la culture"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Tranche d'effectif"
              description="Effectif salarié de l'organisation, avec année de validité."
              htmlFor="legalTrancheEffectif"
              controlClassName="w-full md:w-2/3 flex justify-end items-center gap-2"
            >
              <Input
                id="legalTrancheEffectif"
                className="max-w-md"
                value={settings.legalTrancheEffectif}
                onChange={(e) => setSettings({ ...settings, legalTrancheEffectif: e.target.value })}
                placeholder="Ex. : 0 salarié, 1 à 9, 10 à 19..."
              />
              <Input
                id="legalTrancheEffectifAnnee"
                type="number"
                className="w-24 shrink-0"
                value={settings.legalTrancheEffectifAnnee}
                onChange={(e) => setSettings({ ...settings, legalTrancheEffectifAnnee: e.target.value })}
                placeholder="Année"
                min={2000}
                max={2100}
                aria-label="Année de validité"
              />
            </SettingsCardRow>

            <SettingsCardRow
              label="Catégorie d'entreprise"
              description="Classification (TPE, PME, ETI, GE...), avec année de validité."
              htmlFor="legalCategorieEntreprise"
              controlClassName="w-full md:w-2/3 flex justify-end items-center gap-2"
            >
              <Input
                id="legalCategorieEntreprise"
                className="max-w-md"
                value={settings.legalCategorieEntreprise}
                onChange={(e) => setSettings({ ...settings, legalCategorieEntreprise: e.target.value })}
                placeholder="Ex. : TPE, PME, ETI, GE"
              />
              <Input
                id="legalCategorieEntrepriseAnnee"
                type="number"
                className="w-24 shrink-0"
                value={settings.legalCategorieEntrepriseAnnee}
                onChange={(e) => setSettings({ ...settings, legalCategorieEntrepriseAnnee: e.target.value })}
                placeholder="Année"
                min={2000}
                max={2100}
                aria-label="Année de validité"
              />
            </SettingsCardRow>
          </CardContent>

          <CardFooter className="border-t border-border-custom p-4 flex justify-end gap-3 rounded-b-md">
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              if (activeOrg) setSettings({
                ...settings,
                legalActivitePrincipale: activeOrg.legalActivitePrincipale ?? '',
                legalCategorieJuridique: activeOrg.legalCategorieJuridique ?? '',
                legalSlogan: activeOrg.legalSlogan ?? '',
                legalTrancheEffectif: activeOrg.legalTrancheEffectif ?? '',
                legalTrancheEffectifAnnee: activeOrg.legalTrancheEffectifAnnee ?? '',
                legalCategorieEntreprise: activeOrg.legalCategorieEntreprise ?? '',
                legalCategorieEntrepriseAnnee: activeOrg.legalCategorieEntrepriseAnnee ?? '',
              });
            }}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </CardFooter>
        </Card>
      )}

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
