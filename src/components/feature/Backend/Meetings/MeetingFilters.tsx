'use client';

import React from 'react';
import { Select } from '@/components/ui/atoms';
import { FilterField } from '@/components/ui/molecules';
import { MeetingStatus } from '@/types/meeting';

type SortField = 'date' | 'title';
type SortOrder = 'asc' | 'desc';

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FilterField label="Statut">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as MeetingStatus | 'all')}
          options={[
            { value: 'all', label: 'Tous les statuts' },
            { value: 'upcoming', label: 'À venir' },
            { value: 'completed', label: 'Terminées' },
          ]}
        />
      </FilterField>

      <div className="md:col-span-2" />

      <div className="flex gap-2">
        <FilterField label="Trier par" className="flex-1">
          <Select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField, sortOrder)}
            options={[
              { value: 'date', label: 'Date' },
              { value: 'title', label: 'Titre' },
            ]}
          />
        </FilterField>
        <FilterField label="Ordre" className="w-24">
          <Select
            value={sortOrder}
            onChange={(e) => onSortChange(sortField, e.target.value as SortOrder)}
            options={[
              { value: 'asc', label: '↑ Asc' },
              { value: 'desc', label: '↓ Desc' },
            ]}
          />
        </FilterField>
      </div>
    </div>
  );
}
