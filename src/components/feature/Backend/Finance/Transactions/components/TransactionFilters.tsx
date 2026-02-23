import { Select } from '@/components/ui/atoms'
import { SearchInput, FilterField } from '@/components/ui/molecules'
import { FilterBar } from '../../shared/components'

interface TransactionFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterType: 'all' | 'income' | 'expense'
  onFilterTypeChange: (value: 'all' | 'income' | 'expense') => void
  filterCategory: string
  onFilterCategoryChange: (value: string) => void
  filterStatus: 'all' | 'pending' | 'validated' | 'reconciled'
  onFilterStatusChange: (value: 'all' | 'pending' | 'validated' | 'reconciled') => void
  filterEventId: string
  onFilterEventIdChange: (value: string) => void
  filterProjectId: string
  onFilterProjectIdChange: (value: string) => void
  filterContactId: string
  onFilterContactIdChange: (value: string) => void
  categories: string[]
  events: Array<{ id: string; title: string }>
  projects: Array<{ id: string; title: string }>
  contacts: Array<{ id: string; name: string }>
  showFilters: boolean
  onToggleFilters: () => void
  onResetFilters: () => void
  activeFiltersCount: number
}

export default function TransactionFilters({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  filterEventId,
  onFilterEventIdChange,
  filterProjectId,
  onFilterProjectIdChange,
  filterContactId,
  onFilterContactIdChange,
  categories,
  events,
  projects,
  contacts,
  showFilters,
  onToggleFilters,
  onResetFilters,
  activeFiltersCount,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-4">
      <SearchInput
        label="Recherche"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Rechercher une transaction..."
        className="max-w-md"
      />

      <FilterBar
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      >
        <FilterField label="Type">
          <Select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as any)}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'income', label: 'Entrees' },
              { value: 'expense', label: 'Sorties' },
            ]}
          />
        </FilterField>

        <FilterField label="Categorie">
          <Select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value)}
            options={[
              { value: 'all', label: 'Toutes' },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
          />
        </FilterField>

        <FilterField label="Statut">
          <Select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as any)}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'pending', label: 'En attente' },
              { value: 'validated', label: 'Valide' },
              { value: 'reconciled', label: 'Rapproche' },
            ]}
          />
        </FilterField>

        <FilterField label="Evenement">
          <Select
            value={filterEventId}
            onChange={(e) => onFilterEventIdChange(e.target.value)}
            options={[
              { value: 'all', label: 'Tous' },
              ...events.map((e) => ({ value: e.id, label: e.title })),
            ]}
          />
        </FilterField>

        <FilterField label="Projet">
          <Select
            value={filterProjectId}
            onChange={(e) => onFilterProjectIdChange(e.target.value)}
            options={[
              { value: 'all', label: 'Tous' },
              ...projects.map((p) => ({ value: p.id, label: p.title })),
            ]}
          />
        </FilterField>

        <FilterField label="Contact">
          <Select
            value={filterContactId}
            onChange={(e) => onFilterContactIdChange(e.target.value)}
            options={[
              { value: 'all', label: 'Tous' },
              ...contacts.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </FilterField>
      </FilterBar>
    </div>
  )
}

