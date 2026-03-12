'use client';

import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Wallet,
  Package,
  Users,
  Search,
  Calendar,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: CalendarDays, label: 'Events' },
  { icon: ClipboardList, label: 'Réunions' },
  { icon: Wallet, label: 'Finance' },
  { icon: Package, label: 'Produits' },
  { icon: Users, label: 'Commercial' },
];

/**
 * Mockup statique du dashboard backend (header + sidebar + contenu).
 * Utilise le même thème que le frontend (hérite du document).
 * Dimensions cible : 1920x1080 (aspect 16:9).
 */
export const HeroDashboardPreview: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-2xl',
        'aspect-[1920/1080] max-w-[1920px] mx-auto',
        className
      )}
    >
      <div className="w-full h-full flex flex-col bg-backend">
        {/* Header — 52px (identique au backend) */}
        <header className="h-[52px] min-h-[52px] flex border-b border-border-custom bg-white dark:bg-backend shrink-0">
          <div className="w-[52px] min-w-[52px] h-full flex items-center justify-center border-r border-border-custom shrink-0">
            <Image
              src="/svg/Fichier 2.svg"
              alt="Logo"
              width={20}
              height={40}
              className="brightness-0 invert dark:invert-0"
            />
          </div>
          <div className="flex-1 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-sm text-muted-foreground bg-surface-subtle rounded-full w-40">
                <Search size={14} />
                <span>Rechercher...</span>
              </div>
              <div className="p-2 text-muted-foreground rounded-full hover:bg-surface-subtle">
                <Calendar size={18} />
              </div>
              <div className="h-7 w-7 rounded-full bg-surface-subtle flex items-center justify-center">
                <User size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Sidebar — 52px compact (identique au backend) */}
          <aside className="w-[52px] min-w-[52px] border-r border-border-custom bg-white dark:bg-backend flex flex-col py-2 shrink-0">
            <nav className="flex-1 flex flex-col gap-1 px-2">
              {SIDEBAR_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center justify-center h-9 w-9 rounded-md mx-auto transition-colors',
                    item.active
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md'
                      : 'text-muted-foreground hover:bg-surface-subtle'
                  )}
                >
                  <item.icon size={18} />
                </div>
              ))}
            </nav>
          </aside>

          {/* Contenu principal — bg-backend comme le dashboard */}
          <main className="flex-1 min-w-0 overflow-hidden p-4 lg:p-6 bg-backend">
            <div className="max-w-6xl mx-auto space-y-4">
              {/* Hero texte */}
              <div>
                <h2 className="text-lg font-semibold text-foreground">Bonjour, Utilisateur</h2>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* KPIs — border-border-custom bg-card-bg comme Card/KPICard */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Revenus', value: '12 450 €', change: '+12%' },
                  { label: 'Commandes', value: '24', change: '+5' },
                  { label: 'Événements', value: '3', change: 'En cours' },
                  { label: 'À valider', value: '2', change: 'Posts' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-md border border-border-custom bg-card-bg p-3 shadow-sm"
                  >
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-base font-bold text-foreground mt-0.5 tabular-nums">{kpi.value}</p>
                    <p className="text-[10px] text-green-500 mt-0.5">{kpi.change}</p>
                  </div>
                ))}
              </div>

              {/* Grille 2 colonnes — Cards avec border-border-custom bg-card-bg */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm overflow-hidden">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Prochaine Réunion</h3>
                    <div className="h-16 rounded-md bg-surface-subtle" />
                  </div>
                  <div className="rounded-md border border-border-custom bg-transparent p-3 overflow-hidden">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Planning social</h3>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 rounded bg-surface-subtle" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Prochain Événement</h3>
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-md bg-surface-subtle shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-3/4 bg-surface-subtle rounded mb-2" />
                        <div className="h-3 w-1/2 bg-surface-subtle rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border border-border-custom bg-card-bg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Activité récente</h3>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <div className="w-8 h-8 rounded-full bg-surface-subtle shrink-0" />
                          <div className="flex-1">
                            <div className="h-3 w-full bg-surface-subtle rounded mb-1" />
                            <div className="h-2 w-1/3 bg-surface-subtle rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
