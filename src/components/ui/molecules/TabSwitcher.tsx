'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabSwitcherOption<T extends string = string> {
  value: T;
  label: string;
}

export interface TabSwitcherProps<T extends string = string> {
  options: TabSwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * TabSwitcher - Onglets avec indicateur souligné (style Campagne / Statistiques)
 *
 * Utilisé pour basculer entre des vues dans une section (ex: Campagne / Statistiques).
 * Style : texte + soulignement pour l'onglet actif.
 */
export function TabSwitcher<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: TabSwitcherProps<T>) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 border-b border-border-custom',
        className
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative pb-3 text-sm font-medium transition-colors',
              active ? 'text-foreground' : 'text-zinc-500 hover:text-foreground'
            )}
          >
            {opt.label}
            {active && (
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
