"use client";

import React from 'react';
import { Select } from '@/components/ui/atoms';
import { EventFilters as EventFiltersType, EventStatus, SortField, SortOrder } from '@/types/event';

interface EventFiltersProps {
  filters: EventFiltersType;
  sortField: SortField;
  sortOrder: SortOrder;
  onFiltersChange: (filters: EventFiltersType) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  locations: string[];
  artists: string[];
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  sortField,
  sortOrder,
  onFiltersChange,
  onSortChange,
  locations,
  artists,
}) => {
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

  return (
    <div className="space-y-4">
      {/* Filtres principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Statut */}
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            Statut
          </label>
          <Select value={filters.status} onChange={handleStatusChange}>
            <option value="all">Tous les statuts</option>
            <option value="idea">Idée</option>
            <option value="preparation">En préparation</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Terminé</option>
            <option value="archived">Archivé</option>
          </Select>
        </div>

        {/* Lieu */}
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            Lieu
          </label>
          <Select value={filters.location} onChange={handleLocationChange}>
            <option value="">Tous les lieux</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
        </div>

        {/* Artiste */}
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
            Artiste
          </label>
          <Select value={filters.artist} onChange={handleArtistChange}>
            <option value="">Tous les artistes</option>
            {artists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </Select>
        </div>

        {/* Tri */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Trier par
            </label>
            <Select value={sortField} onChange={handleSortFieldChange}>
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="status">Statut</option>
            </Select>
          </div>
          <div className="w-24">
            <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">
              Ordre
            </label>
            <Select value={sortOrder} onChange={handleSortOrderChange}>
              <option value="asc">↑ Asc</option>
              <option value="desc">↓ Desc</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
