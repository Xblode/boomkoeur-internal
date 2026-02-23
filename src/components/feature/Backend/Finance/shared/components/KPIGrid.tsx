import { Card, CardContent, KPICard } from '@/components/ui/molecules'
import { LucideIcon } from 'lucide-react'

interface KPIData {
  id: string
  label: string
  value: string
  unit: string
  icon: LucideIcon
  color?: string
  bgColor?: string
  subtext: string
  change?: number
}

interface KPIGridProps {
  kpis: KPIData[]
  loading?: boolean
  columns?: number
  className?: string
}

function KPIGrid({ kpis, loading = false, columns = 6, className = '' }: KPIGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${columns} gap-4 ${className}`}>
        {[...Array(columns)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-40 p-0">
              <div />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${columns} gap-4 ${className}`}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          unit={kpi.unit}
          icon={kpi.icon}
          trend={kpi.change}
          trendLabel={kpi.change !== undefined ? 'vs mois précédent' : undefined}
          subtext={kpi.change === undefined ? kpi.subtext : undefined}
        />
      ))}
    </div>
  )
}

export default KPIGrid
export { KPIGrid }