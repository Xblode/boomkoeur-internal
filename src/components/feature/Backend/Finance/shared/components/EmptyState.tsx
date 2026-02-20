import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
  action?: React.ReactNode
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  className = '',
  action
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent h-full w-full min-h-[300px]",
        className
      )}
    >
      {Icon && (
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-full">
          <Icon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-2">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
export { EmptyState }

