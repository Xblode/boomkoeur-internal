'use client';

import React from 'react';
import { Label } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

export interface FilterFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FilterField - Wrapper label + champ pour les barres de filtres
 * Style cohérent : label xs, muted
 */
export function FilterField({ label, htmlFor, children, className }: FilterFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
