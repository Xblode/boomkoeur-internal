'use client';

import React, { useEffect } from 'react';
import { Heading, Text } from '@/components/ui/atoms';
import { SectionHeader } from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { BookOpen } from 'lucide-react';

const LAYOUT_HIERARCHY = [
  { name: 'BackendLayout', file: 'app/dashboard/layout.tsx', desc: 'Header fixe, Sidebar nav principale, Toolbar globale (masquée sur pages détail).' },
  { name: 'PageLayout', file: 'FinanceLayout, DocsLayoutConfig, etc.', desc: 'PageSidebar + PageContentLayout.' },
  { name: 'Éléments flottants', file: '—', desc: 'CommentsChatPanel, Modal (optionnels).' },
];

const COMPONENTS_BY_SLOT = [
  { name: 'PageSidebar', props: 'backLink, entitySelector, sections, activeSectionId, basePath, children (SidebarCard).' },
  { name: 'PageContentLayout', props: 'alert (PageAlert), toolbar, sectionHeader (SectionHeader), maxWidth, children.' },
  { name: 'PageToolbar / ToolbarFilterDropdown', props: 'filters (ToolbarFilterDropdown, Select), actions (Button via PageToolbarActions).' },
  { name: 'PageAlert', props: 'variant: info | warning | error | success, message, onDismiss.' },
  { name: 'SectionHeader', props: 'title, icon?, subtitle?, actions?, metadata?, tags?, gridColumns?.' },
  { name: 'SectionNavLink', props: 'href ou onClick, icon, label, active.' },
  { name: 'BackLink', props: 'href, label.' },
  { name: 'SidebarCard', props: 'icon, title, subtitle?, href?, onClick?.' },
];

export function ReferencePage() {
  const { setToolbar } = useToolbar();

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader icon={<BookOpen size={28} />} title="Référence" subtitle="Architecture des layouts et composants par slot." />
      </div>
      <div className="space-y-10">
        {/* Hiérarchie des layouts */}
        <section>
          <Heading level={3} className="mb-4">Hiérarchie des layouts</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LAYOUT_HIERARCHY.map((item, i) => (
              <div
                key={item.name}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-foreground">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-foreground">{item.name}</span>
                </div>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">{item.file}</p>
                <Text variant="muted" className="text-sm">{item.desc}</Text>
              </div>
            ))}
          </div>
        </section>

        {/* Composants par slot */}
        <section>
          <Heading level={3} className="mb-4">Composants par slot</Heading>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Composant</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Props principales</th>
                </tr>
              </thead>
              <tbody>
                {COMPONENTS_BY_SLOT.map((item) => (
                  <tr key={item.name} className="border-b border-zinc-200/50 dark:border-zinc-800/50 last:border-0">
                    <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">{item.props}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Schéma de structure */}
        <section>
          <Heading level={3} className="mb-4">Schéma de structure</Heading>
          <pre className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg text-xs overflow-x-auto border border-zinc-200 dark:border-zinc-700">
{`BackendLayout
├── Header (52px)
├── Sidebar (200px / 52px compact)
└── Content
    └── PageLayout (flex)
        ├── PageSidebar (256px)
        │   ├── BackLink
        │   ├── EntitySelector / Thème
        │   ├── SectionNavLink[]
        │   └── SidebarCard[] (children)
        └── PageContentLayout
            ├── PageAlert (sticky)
            ├── PageToolbar (sticky)
            │   ├── filters: ToolbarFilterDropdown, Select
            │   └── actions: Button[] (dernier = primary)
            ├── SectionHeader
            └── children`}
          </pre>
        </section>
      </div>
    </>
  );
}
