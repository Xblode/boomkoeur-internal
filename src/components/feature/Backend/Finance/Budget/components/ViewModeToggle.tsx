import { Button } from '@/components/ui/atoms'
import { LayoutGrid, List } from 'lucide-react'

interface ViewModeToggleProps {
  viewMode: 'kanban' | 'list'
  onViewModeChange: (mode: 'kanban' | 'list') => void
  className?: string
}

export default function ViewModeToggle({ 
  viewMode, 
  onViewModeChange, 
  className = '' 
}: ViewModeToggleProps) {
  return (
    <div className={`inline-flex items-center border-2 border-border-custom rounded-lg ${className}`}>
      <Button
        variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('kanban')}
        className="rounded-r-none border-0"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Kanban
      </Button>
      <Button
        variant={viewMode === 'list' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="rounded-l-none border-0"
      >
        <List className="w-4 h-4 mr-2" />
        Liste
      </Button>
    </div>
  )
}

