import { Button } from '@/components/ui/atoms'
import { Select } from '@/components/ui/atoms'
import { Filter, X } from 'lucide-react'
import { ReactNode } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'

interface FilterBarProps {
  showFilters: boolean
  onToggleFilters: () => void
  children: ReactNode
  activeFiltersCount?: number
  onResetFilters?: () => void
  className?: string
}

function FilterBar({
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
            Reinitialiser
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-background-secondary border-2 border-border-custom rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterBar
export { FilterBar }