'use client'

import { Card, CardContent } from '@/components/ui/molecules'
import { LucideIcon } from 'lucide-react'

interface CompactKPICardProps {
  label: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  className?: string
}

export default function CompactKPICard({
  label,
  value,
  unit = 'EUR',
  icon: Icon,
  trend,
  trendLabel,
  className = '',
}: CompactKPICardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <Icon className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          {unit && <span className="text-sm ml-1 text-zinc-500">{unit}</span>}
        </div>
        {trend !== undefined && trendLabel && (
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span> {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

