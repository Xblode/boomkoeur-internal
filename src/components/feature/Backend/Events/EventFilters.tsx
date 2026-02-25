"use client";

import React, { useState } from 'react';
import { Select, Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { SearchInput, FilterField } from '@/components/ui/molecules';
import { EventFilters as EventFiltersType, EventStatus, SortField, SortOrder } from '@/types/event';
import { cn } from '@/lib/utils';
import { Tag, MapPin, Music, ArrowUpDown } from 'lucide-react';

interface EventFiltersProps {
  filters: EventFiltersType;
  sortField: SortField;
  sortOrder: SortOrder;
  onFiltersChange: (filters: EventFiltersType) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  locations: string[];
  artists: string[];
}

const STATUS_OPTIONS = [
  { value: 'all' as const, label: 'Tous les statuts' },
  { value: 'idea' as const, label: 'Idée' },
  { value: 'preparation' as const, label: 'En préparation' },
  { value: 'confirmed' as const, label: 'Confirmé' },
  { value: 'completed' as const, label: 'Terminé' },
  { value: 'archived' as const, label: 'Archivé' },
];

const SORT_FIELD_OPTIONS = [
  { value: 'date' as SortField, label: 'Date' },
  { value: 'name' as SortField, label: 'Nom' },
  { value: 'status' as SortField, label: 'Statut' },
];

const SORT_ORDER_OPTIONS = [
  { value: 'asc' as SortOrder, label: '↑ Asc' },
  { value: 'desc' as SortOrder, label: '↓ Desc' },
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  sortField,
  sortOrder,
  onFiltersChange,
  onSortChange,
  locations,
  artists,
}) => {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<string | null>(null);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value as EventStatus | 'all' });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, location: e.target.value });
  };

  const handleArtistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, artist: e.target.value });
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as SortField, sortOrder);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(sortField, e.target.value as SortOrder);
  };

  const FilterIconButton = ({
    id,
    icon: Icon,
    label,
    children,
  }: {
    id: string;
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="shrink-0 md:hidden">
      <Popover open={filterPopoverOpen === id} onOpenChange={(o) => setFilterPopoverOpen(o ? id : null)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            aria-label={label}
          >
            <Icon size={18} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="end">
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-5 md:gap-4">
      {/* Recherche - pleine largeur sur mobile */}
      <div className="w-full min-w-0 md:col-span-1">
        <SearchInput
          label="Recherche"
          placeholder="Nom, lieu, description..."
          value={filters.search}
          onChange={(v) => onFiltersChange({ ...filters, search: v })}
        />
      </div>

      {/* Mobile: boutons filtres en ligne */}
      <div className="flex flex-wrap items-end gap-2 md:hidden">
        <FilterIconButton id="status" icon={Tag} label="Filtrer par statut">
          <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Statut</div>
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({ ...filters, status: opt.value });
                setFilterPopoverOpen(null);
              }}
              className={cn(
                'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                filters.status === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
              )}
            >
              {opt.label}
            </Button>
          ))}
        </FilterIconButton>
        <FilterIconButton id="location" icon={MapPin} label="Filtrer par lieu">
          <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Lieu</div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onFiltersChange({ ...filters, location: '' });
              setFilterPopoverOpen(null);
            }}
            className={cn(
              'w-full justify-start px-3 py-1.5 rounded-md text-sm',
              !filters.location && 'bg-zinc-100 dark:bg-zinc-800'
            )}
          >
            Tous les lieux
          </Button>
          {locations.map((location) => (
            <Button
              key={location}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({ ...filters, location });
                setFilterPopoverOpen(null);
              }}
              className={cn(
                'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                filters.location === location && 'bg-zinc-100 dark:bg-zinc-800'
              )}
            >
              {location}
            </Button>
          ))}
        </FilterIconButton>
        <FilterIconButton id="artist" icon={Music} label="Filtrer par artiste">
          <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Artiste</div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onFiltersChange({ ...filters, artist: '' });
              setFilterPopoverOpen(null);
            }}
            className={cn(
              'w-full justify-start px-3 py-1.5 rounded-md text-sm',
              !filters.artist && 'bg-zinc-100 dark:bg-zinc-800'
            )}
          >
            Tous les artistes
          </Button>
          {artists.map((artist) => (
            <Button
              key={artist}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({ ...filters, artist });
                setFilterPopoverOpen(null);
              }}
              className={cn(
                'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                filters.artist === artist && 'bg-zinc-100 dark:bg-zinc-800'
              )}
            >
              {artist}
            </Button>
          ))}
        </FilterIconButton>
        <div className="shrink-0">
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
      </div>

      {/* Statut - desktop */}
      <div className="hidden md:block">
        <FilterField label="Statut">
          <Select value={filters.status} onChange={handleStatusChange}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </FilterField>
      </div>

      {/* Lieu - desktop */}
      <div className="hidden md:block">
        <FilterField label="Lieu">
          <Select value={filters.location} onChange={handleLocationChange}>
            <option value="">Tous les lieux</option>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </Select>
        </FilterField>
      </div>

      {/* Artiste - desktop */}
      <div className="hidden md:block">
        <FilterField label="Artiste">
          <Select value={filters.artist} onChange={handleArtistChange}>
            <option value="">Tous les artistes</option>
            {artists.map((artist) => (
              <option key={artist} value={artist}>{artist}</option>
            ))}
          </Select>
        </FilterField>
      </div>

      {/* Trier par + Ordre - desktop */}
      <div className="hidden md:flex gap-2 lg:col-span-1">
        <FilterField label="Trier par" className="flex-1">
          <Select value={sortField} onChange={handleSortFieldChange}>
            {SORT_FIELD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Ordre" className="w-24">
          <Select value={sortOrder} onChange={handleSortOrderChange}>
            {SORT_ORDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </FilterField>
      </div>
    </div>
  );
};
