'use client';

import React, { useState } from 'react';
import { Select, Button } from '@/components/ui/atoms';
import { FilterField } from '@/components/ui/molecules';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { MeetingStatus } from '@/types/meeting';
import { cn } from '@/lib/utils';
import { Activity, ArrowUpDown } from 'lucide-react';

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

const STATUS_OPTIONS = [
  { value: 'all' as const, label: 'Tous les statuts' },
  { value: 'upcoming' as const, label: 'À venir' },
  { value: 'completed' as const, label: 'Terminées' },
];

const SORT_FIELD_OPTIONS = [
  { value: 'date' as SortField, label: 'Date' },
  { value: 'title' as SortField, label: 'Titre' },
];

const SORT_ORDER_OPTIONS = [
  { value: 'asc' as SortOrder, label: '↑ Asc' },
  { value: 'desc' as SortOrder, label: '↓ Desc' },
];

export interface MeetingFiltersProps {
  statusFilter: MeetingStatus | 'all';
  sortField: SortField;
  sortOrder: SortOrder;
  onStatusFilterChange: (v: MeetingStatus | 'all') => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export function MeetingFilters({
  statusFilter,
  sortField,
  sortOrder,
  onStatusFilterChange,
  onSortChange,
}: MeetingFiltersProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:gap-4">
      {/* Mobile: boutons filtres en ligne */}
      <div className="flex flex-wrap items-end gap-2 md:hidden">
        <Popover
          open={filterPopoverOpen === 'status'}
          onOpenChange={(o) => setFilterPopoverOpen(o ? 'status' : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              aria-label="Filtrer par statut"
            >
              <Activity size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="end">
            <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Statut</div>
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onStatusFilterChange(opt.value);
                  setFilterPopoverOpen(null);
                }}
                className={cn(
                  'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                  statusFilter === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                )}
              >
                {opt.label}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
        <Popover
          open={filterPopoverOpen === 'sort'}
          onOpenChange={(o) => setFilterPopoverOpen(o ? 'sort' : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              aria-label="Trier"
            >
              <ArrowUpDown size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="end">
            <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Trier par</div>
            {SORT_FIELD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSortChange(opt.value, sortOrder);
                  setFilterPopoverOpen(null);
                }}
                className={cn(
                  'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                  sortField === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                )}
              >
                {opt.label}
              </Button>
            ))}
            <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
            <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Ordre</div>
            {SORT_ORDER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSortChange(sortField, opt.value);
                  setFilterPopoverOpen(null);
                }}
                className={cn(
                  'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                  sortOrder === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                )}
              >
                {opt.label}
              </Button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Statut - desktop */}
      <div className="hidden md:block">
        <FilterField label="Statut">
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as MeetingStatus | 'all')}
            options={STATUS_OPTIONS}
          />
        </FilterField>
      </div>

      <div className="hidden md:block md:col-span-2" />

      {/* Trier par + Ordre - desktop */}
      <div className="hidden md:flex gap-2">
        <FilterField label="Trier par" className="flex-1">
          <Select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField, sortOrder)}
            options={SORT_FIELD_OPTIONS}
          />
        </FilterField>
        <FilterField label="Ordre" className="w-24">
          <Select
            value={sortOrder}
            onChange={(e) => onSortChange(sortField, e.target.value as SortOrder)}
            options={SORT_ORDER_OPTIONS}
          />
        </FilterField>
      </div>
    </div>
  );
}
