'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers';
import { Card, CardContent, CardFooter, SettingsCardRow } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { Moon, Sun, Monitor, PanelLeft, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarMode } from '@/hooks';
import Link from 'next/link';

export default function SettingsApparencePage() {
  const { theme, setTheme } = useTheme();
  const { sidebarMode, setSidebarMode } = useSidebarMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Apparence</h1>
        <p className="text-muted-foreground">
          Personnalisez l&apos;apparence de l&apos;interface d&apos;administration.
        </p>
      </div>

      <Card
        variant="settings"
        title="Apparence"
        description="Personnalisez l'apparence de l'interface d'administration."
      >
        <CardContent className="p-0 divide-y divide-border-custom">

          <SettingsCardRow
            label="Thème de l'interface"
            description="Choisissez entre le mode clair, sombre, système ou la palette personnalisée."
          >
            <div className="flex items-center gap-2 p-1 bg-toggle rounded-lg w-fit border border-border-custom flex-wrap">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  theme === 'light'
                    ? "bg-toggle-active text-foreground shadow-sm"
                    : "text-zinc-500 hover:text-foreground"
                )}
              >
                <Sun size={16} />
                Clair
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  theme === 'dark'
                    ? "bg-toggle-active text-foreground shadow-sm"
                    : "text-zinc-500 hover:text-foreground"
                )}
              >
                <Moon size={16} />
                Sombre
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  theme === 'system'
                    ? "bg-toggle-active text-foreground shadow-sm"
                    : "text-zinc-500 hover:text-foreground"
                )}
              >
                <Monitor size={16} />
                Système
              </button>
              <button
                onClick={() => setTheme('custom')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  theme === 'custom'
                    ? "bg-toggle-active text-foreground shadow-sm"
                    : "text-zinc-500 hover:text-foreground"
                )}
              >
                <span className="w-4 h-4 rounded-full bg-[var(--color-accent)]" aria-hidden />
                Custom
              </button>
            </div>
          </SettingsCardRow>

          <SettingsCardRow
            label="Mode de la sidebar"
            description="Choisissez entre le mode compact (icônes seules) ou étendu (icônes + labels)."
          >
            <div className="flex items-center gap-2 p-1 bg-toggle rounded-lg w-fit border border-border-custom">
              <button
                onClick={() => setSidebarMode('compact')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  sidebarMode === 'compact'
                    ? "bg-toggle-active text-foreground shadow-sm"
                    : "text-zinc-500 hover:text-foreground"
                )}
              >
                <PanelLeft size={16} />
                Compact
              </button>
              <button
                onClick={() => setSidebarMode('expanded')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  sidebarMode === 'expanded'
                    ? "bg-toggle-active text-foreground shadow-sm"
                    : "text-zinc-500 hover:text-foreground"
                )}
              >
                <PanelLeftOpen size={16} />
                Étendu
              </button>
            </div>
          </SettingsCardRow>

          <SettingsCardRow
            label="Design System"
            description="Accédez à la bibliothèque de composants."
          >
            <div className="flex items-center gap-2">
              <Link href="/dashboard/design-system">
                <Button variant="outline" size="md">
                  Voir le design system
                </Button>
              </Link>
            </div>
          </SettingsCardRow>

        </CardContent>

        <CardFooter className="border-t border-border-custom p-4 flex justify-end rounded-b-md">
          <p className="text-xs text-text-tertiary">Les changements d&apos;apparence sont appliqués immédiatement.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
