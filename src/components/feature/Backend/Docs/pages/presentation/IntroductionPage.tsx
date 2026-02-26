'use client';

import React, { useEffect } from 'react';
import { Text } from '@/components/ui/atoms';
import { SectionHeader } from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { siteConfig } from '@/config/site';
import { backendNavigation } from '@/config/navigation';
import { FlaskConical } from 'lucide-react';
import Link from 'next/link';

export function IntroductionPage() {
  const { setToolbar } = useToolbar();

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<FlaskConical size={28} />}
          title="Introduction"
          subtitle="But du site et présentation des différentes pages."
        />
      </div>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">À propos de {siteConfig.name}</h2>
          <Text variant="muted" className="block">
            {siteConfig.description}
          </Text>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Les différentes pages du site</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Le dashboard est organisé en plusieurs espaces selon les besoins de gestion :
          </p>
          <ul className="space-y-3">
            {backendNavigation.map((item) => (
              <li key={item.href} className="flex items-start gap-3">
                <item.icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <Link href={item.href} className="font-medium text-foreground hover:underline">
                    {item.label}
                  </Link>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {item.label === 'Dashboard' && 'Vue d\'ensemble et statistiques principales.'}
                    {item.label === 'Events' && 'Gestion des événements, billetterie, artistes et campagnes.'}
                    {item.label === 'Réunions' && 'Ordre du jour, comptes-rendus et planning des réunions.'}
                    {item.label === 'Finance' && 'Trésorerie, transactions, factures, budget et bilan.'}
                    {item.label === 'Produits' && 'Catalogue produits, variantes, stock et commandes.'}
                    {item.label === 'Commercial' && 'Gestion des contacts et opportunités commerciales.'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
            D&apos;autres espaces sont accessibles depuis le menu : Admin, Paramètres, Profil, Calendrier.
          </p>
        </section>
      </div>
    </>
  );
}
