'use client';

import React from 'react';
import { Input } from '@/components/ui/atoms';
import { Label } from '@/components/ui/atoms';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
}

/**
 * SearchInput - Input de recherche avec icône Search pour les barres de filtres
 * Aligné en hauteur avec Input et Select (h-10)
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
  label,
  id,
  className,
}: SearchInputProps) {
  const inputId = id ?? `search-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </Label>
      )}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          size={15}
        />
        <Input
          id={inputId}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
