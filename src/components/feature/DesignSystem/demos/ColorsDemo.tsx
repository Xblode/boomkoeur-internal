'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';

interface ColorItemProps {
  name: string;
  variable: string;
  className?: string;
}

const ColorItem: React.FC<ColorItemProps> = ({ name, variable, className }) => {
  return (
    <div className="flex flex-col gap-2">
      <div 
        className={`h-16 w-full rounded-lg border border-border-custom shadow-sm ${className}`}
        style={!className ? { backgroundColor: `var(${variable})` } : undefined}
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{variable}</p>
      </div>
    </div>
  );
};

export default function ColorsDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Couleurs</h2>
        <p className="text-muted-foreground">
          Palette de couleurs sémantique utilisée à travers l'application.
        </p>
      </div>

      {/* Backgrounds */}
      <Card>
        <CardHeader>
          <CardTitle>Backgrounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorItem name="Background" variable="--background" className="bg-background" />
            <ColorItem name="Backend Bg" variable="--bg-backend" className="bg-backend" />
            <ColorItem name="Card Bg" variable="--bg-card" className="bg-card" />
          </div>
        </CardContent>
      </Card>

      {/* Surfaces */}
      <Card>
        <CardHeader>
          <CardTitle>Surfaces & UI Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorItem name="Toggle" variable="--bg-toggle" className="bg-toggle" />
            <ColorItem name="Toggle Active" variable="--bg-toggle-active" className="bg-toggle-active" />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content (Text)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorItem name="Foreground" variable="--foreground" className="bg-foreground" />
            <ColorItem name="Muted Foreground" variable="text-muted-foreground" className="bg-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Borders */}
      <Card>
        <CardHeader>
          <CardTitle>Borders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorItem name="Border" variable="--border-color" className="bg-border-custom" />
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorItem name="Primary" variable="--primary" className="bg-primary" />
            <ColorItem name="Primary Foreground" variable="--primary-foreground" className="bg-primary-foreground" />
            <ColorItem name="Secondary" variable="--secondary" className="bg-secondary" />
            <ColorItem name="Accent" variable="--accent" className="bg-accent" />
          </div>
        </CardContent>
      </Card>

      {/* Feedback Colors (EventStatusBadge / badges Events) */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <p className="text-sm text-muted-foreground">
            Couleurs des badges utilisés sur la page Events (EventStatusBadge).
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-sm bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Idée</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Idée</p>
                <p className="font-mono text-xs text-muted-foreground">bg-yellow-100 text-yellow-700</p>
                <p className="font-mono text-xs text-muted-foreground">dark:bg-yellow-900/30 dark:text-yellow-300</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Préparation</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Préparation</p>
                <p className="font-mono text-xs text-muted-foreground">bg-blue-100 text-blue-700</p>
                <p className="font-mono text-xs text-muted-foreground">dark:bg-blue-900/30 dark:text-blue-300</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-green-200 dark:border-green-800 shadow-sm bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Confirmé</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Confirmé</p>
                <p className="font-mono text-xs text-muted-foreground">bg-green-100 text-green-700</p>
                <p className="font-mono text-xs text-muted-foreground">dark:bg-green-900/30 dark:text-green-300</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Terminé</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Terminé / Archivé</p>
                <p className="font-mono text-xs text-muted-foreground">bg-zinc-100 text-zinc-700</p>
                <p className="font-mono text-xs text-muted-foreground">dark:bg-zinc-800/50 dark:text-zinc-400</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-red-200 dark:border-red-800 shadow-sm bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Erreur</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Erreur / Destructif</p>
                <p className="font-mono text-xs text-muted-foreground">bg-red-100 text-red-700</p>
                <p className="font-mono text-xs text-muted-foreground">dark:bg-red-900/30 dark:text-red-300</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
