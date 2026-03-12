'use client';

import React from 'react';
import {
  AlignLeft,
  FileImage,
  Music,
  CalendarClock,
  Ticket,
  ShoppingBag,
  Link as LinkIcon,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EVENT_SECTIONS = [
  { id: 'info', label: 'Informations', icon: AlignLeft },
  { id: 'campagne', label: 'Campagne', icon: FileImage },
  { id: 'artistes', label: 'Artistes', icon: Music },
  { id: 'planning', label: 'Planning', icon: CalendarClock },
  { id: 'billetterie', label: 'Billetterie', icon: Ticket },
  { id: 'point-de-ventes', label: 'Point de ventes', icon: ShoppingBag },
  { id: 'liens', label: 'Éléments liés', icon: LinkIcon },
] as const;

export type EventPageVariant = (typeof EVENT_SECTIONS)[number]['id'];

interface EventPagePreviewProps {
  variant: EventPageVariant;
  onSectionChange?: (variant: EventPageVariant) => void;
  className?: string;
}

function EventPageContent({ variant }: { variant: EventPageVariant }) {
  switch (variant) {
    case 'info':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Informations générales</h2>
            <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm space-y-3">
              <div className="flex gap-3">
                <div className="h-16 w-24 rounded-md bg-surface-subtle shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-surface-subtle rounded" />
                  <div className="h-3 w-1/2 bg-surface-subtle rounded" />
                  <div className="h-3 w-1/3 bg-surface-subtle rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 rounded bg-surface-subtle" />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">Workflow</h3>
            <div className="flex gap-2">
              {['Préparation', 'Production', 'Communication'].map((phase, i) => (
                <div key={phase} className="h-6 flex-1 rounded bg-surface-subtle" />
              ))}
            </div>
          </div>
        </>
      );
    case 'campagne':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Campagne de communication</h2>
            <div className="grid grid-cols-3 gap-2">
              {['brainstorming', 'created', 'review', 'validated', 'scheduled'].map((status) => (
                <div key={status} className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm">
                  <div className="h-12 rounded bg-surface-subtle mb-2" />
                  <div className="h-3 w-full bg-surface-subtle rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">Posts à valider</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded bg-surface-subtle shrink-0" />
                  <div className="flex-1 h-6 rounded bg-surface-subtle" />
                </div>
              ))}
            </div>
          </div>
        </>
      );
    case 'artistes':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Line-up</h2>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 rounded-md border border-border-custom bg-card-bg p-3 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-surface-subtle shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-1/3 bg-surface-subtle rounded" />
                    <div className="h-3 w-1/4 bg-surface-subtle rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    case 'planning':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Planning éditorial</h2>
            <div className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm overflow-hidden">
              <div className="flex gap-2 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                  <div key={d} className="h-6 flex-1 rounded bg-surface-subtle text-center text-xs" />
                ))}
              </div>
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 rounded bg-surface-subtle" />
                ))}
              </div>
            </div>
          </div>
        </>
      );
    case 'billetterie':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Billetterie Shotgun</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Places vendues</p>
                <p className="text-xl font-bold text-foreground">248 / 500</p>
              </div>
              <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">CA</p>
                <p className="text-xl font-bold text-foreground">12 400 €</p>
              </div>
            </div>
            <div className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">Tarifs</h3>
              <div className="space-y-2">
                {['Early bird', 'Plein tarif', 'VIP'].map((t) => (
                  <div key={t} className="flex justify-between h-6 rounded bg-surface-subtle" />
                ))}
              </div>
            </div>
          </div>
        </>
      );
    case 'point-de-ventes':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Points de vente</h2>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm flex gap-3">
                  <div className="w-10 h-10 rounded bg-surface-subtle shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-1/2 bg-surface-subtle rounded" />
                    <div className="h-3 w-1/3 bg-surface-subtle rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    case 'liens':
      return (
        <>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Éléments liés</h2>
            <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm">
              <div className="space-y-2">
                {['Réunions', 'Produits', 'Factures'].map((type) => (
                  <div key={type} className="flex gap-2 items-center h-10 rounded bg-surface-subtle" />
                ))}
              </div>
            </div>
          </div>
        </>
      );
    default:
      return null;
  }
}

/**
 * Mockup statique d'une page Event du dashboard.
 * Variants : info, campagne, artistes, planning, billetterie, point-de-ventes, liens.
 */
export const EventPagePreview: React.FC<EventPagePreviewProps> = ({ variant, onSectionChange, className }) => {
  const activeIndex = EVENT_SECTIONS.findIndex((s) => s.id === variant);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-2xl',
        'aspect-[4/3] min-h-[320px] max-w-[900px] mx-auto',
        className
      )}
    >
      <div className="w-full h-full flex bg-backend">
        {/* PageSidebar (Event selector + sections) */}
        <aside className="w-48 min-w-[192px] border-r border-border-custom bg-white dark:bg-backend flex flex-col shrink-0">
          <div className="p-2 border-b border-border-custom flex items-center gap-1 text-muted-foreground">
            <ChevronLeft size={16} />
            <span className="text-xs">Retour aux événements</span>
          </div>
          <div className="p-2 border-b border-border-custom">
            <div className="h-8 rounded bg-surface-subtle" />
          </div>
          <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
            {EVENT_SECTIONS.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange?.(section.id)}
                className={cn(
                  'flex items-center gap-2 h-8 px-2 rounded-md text-sm w-full text-left transition-colors cursor-pointer',
                  i === activeIndex
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90'
                    : 'text-muted-foreground hover:bg-surface-subtle'
                )}
              >
                <section.icon size={14} />
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-hidden p-4 bg-backend">
          <div className="max-w-2xl space-y-4">
            <EventPageContent variant={variant} />
          </div>
        </main>
      </div>
    </div>
  );
};
