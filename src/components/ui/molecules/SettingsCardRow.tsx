'use client';

import React from 'react';
import { Label } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

export interface SettingsCardRowProps {
  label: string;
  description?: string;
  htmlFor?: string;
  controlClassName?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * SettingsCardRow - Ligne de paramètre (label à gauche, contrôle à droite).
 * Utilisé dans les pages Apparence, Admin, Profile.
 */
export function SettingsCardRow({
  label,
  description,
  htmlFor,
  controlClassName = 'shrink-0',
  className,
  children,
}: SettingsCardRowProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 p-4', className)}>
      <div className="space-y-1">
        <Label htmlFor={htmlFor} className="text-base font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      <div className={cn(controlClassName)}>
        {children}
      </div>
    </div>
  );
}
