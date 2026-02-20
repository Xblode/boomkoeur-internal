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

      {/* Feedback Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-border-custom shadow-sm bg-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Success</p>
                <p className="font-mono text-xs text-muted-foreground">text-green-500 / bg-green-500</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-border-custom shadow-sm bg-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Error</p>
                <p className="font-mono text-xs text-muted-foreground">text-red-500 / bg-red-500</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-border-custom shadow-sm bg-yellow-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Warning</p>
                <p className="font-mono text-xs text-muted-foreground">text-yellow-500 / bg-yellow-500</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-16 w-full rounded-lg border border-border-custom shadow-sm bg-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Info</p>
                <p className="font-mono text-xs text-muted-foreground">text-blue-500 / bg-blue-500</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
