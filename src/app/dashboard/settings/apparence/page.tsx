'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardFooter } from '@/components/ui/molecules';
import { Label, Button } from '@/components/ui/atoms';
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
        title="Apparence"
        description="Personnalisez l'apparence de l'interface d'administration."
      >
        <CardContent className="p-0 divide-y divide-border-custom">

          {/* Thème de l'interface */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Thème de l&apos;interface</Label>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choisissez entre le mode clair, sombre ou système.
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-toggle rounded-lg w-fit border border-border-custom shrink-0">
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
            </div>
          </div>

          {/* Mode de la sidebar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Mode de la sidebar</Label>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choisissez entre le mode compact (icônes seules) ou étendu (icônes + labels).
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-toggle rounded-lg w-fit border border-border-custom shrink-0">
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
          </div>

          {/* Design System */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Design System</Label>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Accédez à la bibliothèque de composants.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/dashboard/design-system">
                <Button variant="outline" size="md">
                  Voir le design system
                </Button>
              </Link>
            </div>
          </div>

        </CardContent>

        <CardFooter className="border-t border-border-custom p-4 flex justify-end rounded-b-md">
          <p className="text-xs text-zinc-500">Les changements d&apos;apparence sont appliqués immédiatement.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
