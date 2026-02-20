import { Card, CardHeader, CardContent } from '@/components/ui/molecules'
import { ReactNode } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'

interface KanbanColumnProps {
  title: string
  count: number
  color: string
  children: ReactNode
  className?: string
}

export default function KanbanColumn({ 
  title, 
  count, 
  color, 
  children, 
  className = '' 
}: KanbanColumnProps) {
  return (
    <div className={`flex flex-col min-w-[320px] ${className}`}>
      <div className={`mb-4 px-4 py-2 rounded-lg border-2 ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold uppercase text-sm">{title}</h3>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-background-tertiary">
            {count}
          </span>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        {children}
      </div>
    </div>
  )
}

