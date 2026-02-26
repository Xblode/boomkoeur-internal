'use client';

import React, { useEffect } from 'react';
import { Text } from '@/components/ui/atoms';
import { SectionHeader } from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { Plug2 } from 'lucide-react';
import Link from 'next/link';

const STACK_ITEMS = [
  { name: 'Next.js', version: '16', desc: 'Framework React avec App Router, SSR et API routes.' },
  { name: 'React', version: '19', desc: 'Bibliothèque UI avec hooks et Server Components.' },
  { name: 'TypeScript', desc: 'Typage statique pour plus de robustesse.' },
  { name: 'Tailwind CSS', version: '4', desc: 'Utility-first CSS et design tokens.' },
  { name: 'Supabase', desc: 'Backend-as-a-Service : auth, base de données, storage.' },
  { name: 'Framer Motion', desc: 'Animations et transitions.' },
  { name: 'Recharts', desc: 'Graphiques et visualisations de données.' },
  { name: 'Radix UI', desc: 'Composants accessibles (Popover, Slot, etc.).' },
  { name: 'Lucide React', desc: 'Icônes.' },
  { name: 'next-themes', desc: 'Gestion des thèmes clair/sombre/système.' },
];

const INTEGRATIONS = [
  { name: 'Google', desc: 'Calendar, Drive, Docs, Sheets, Gmail.', href: '/dashboard/admin/integration' },
  { name: 'Meta (Facebook / Instagram)', desc: 'Authentification, publications, insights.', href: '/dashboard/admin/integration' },
];

export function StackPage() {
  const { setToolbar } = useToolbar();

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<Plug2 size={28} />}
          title="Stack & Intégrations"
          subtitle="Technologies utilisées et intégrations tierces."
        />
      </div>
      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Stack technique</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {STACK_ITEMS.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/20"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.name}</span>
                  {item.version && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">v{item.version}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Intégrations</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Les intégrations sont configurables depuis la page Administration.
          </p>
          <div className="space-y-4">
            {INTEGRATIONS.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{item.desc}</p>
                </div>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-primary hover:underline shrink-0"
                >
                  Configurer →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
