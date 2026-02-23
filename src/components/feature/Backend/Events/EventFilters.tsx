"use client";

import React from 'react';
import { Select } from '@/components/ui/atoms';
import { SearchInput, FilterField } from '@/components/ui/molecules';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SearchInput
          label="Recherche"
          placeholder="Nom, lieu, description..."
          value={filters.search}
          onChange={(v) => onFiltersChange({ ...filters, search: v })}
        />

        <FilterField label="Statut">
          <Select value={filters.status} onChange={handleStatusChange}>
            <option value="all">Tous les statuts</option>
            <option value="idea">Idée</option>
            <option value="preparation">En préparation</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Terminé</option>
            <option value="archived">Archivé</option>
          </Select>
        </FilterField>

        <FilterField label="Lieu">
          <Select value={filters.location} onChange={handleLocationChange}>
            <option value="">Tous les lieux</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Artiste">
          <Select value={filters.artist} onChange={handleArtistChange}>
            <option value="">Tous les artistes</option>
            {artists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </Select>
        </FilterField>

        <div className="flex gap-2">
          <FilterField label="Trier par" className="flex-1">
            <Select value={sortField} onChange={handleSortFieldChange}>
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="status">Statut</option>
            </Select>
          </FilterField>
          <FilterField label="Ordre" className="w-24">
            <Select value={sortOrder} onChange={handleSortOrderChange}>
              <option value="asc">↑ Asc</option>
              <option value="desc">↓ Desc</option>
            </Select>
          </FilterField>
        </div>
      </div>
    </div>
  );
};
