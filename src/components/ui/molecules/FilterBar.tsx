'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/atoms';
import { Filter, X } from 'lucide-react';

export interface FilterBarProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  children: ReactNode;
  activeFiltersCount?: number;
  onResetFilters?: () => void;
  className?: string;
}

export function FilterBar({
  showFilters,
  onToggleFilters,
  children,
  activeFiltersCount = 0,
  onResetFilters,
  className = '',
}: FilterBarProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleFilters}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        {activeFiltersCount > 0 && onResetFilters && (
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            <X className="w-4 h-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border-2 border-border-custom rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
