import { Card, CardContent } from '@/components/ui/molecules'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  id: string
  label: string
  value: string
  unit: string
  icon: LucideIcon
  color: string
  bgColor: string
  subtext: string
  change?: number
  className?: string
}

function KPICard({
  id,
  label,
  value,
  unit,
  icon: Icon,
  color,
  bgColor,
  subtext,
  change,
  className = '',
}: KPICardProps) {
  return (
    <Card
      key={id}
      className={`hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 group ${className}`}
    >
      <CardContent className="p-2">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-lg ${bgColor} transition-transform group-hover:scale-110`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {change !== undefined && change !== 0 && (
            <div
              className={`flex items-center gap-1 text-xs font-bold ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-label text-xs uppercase tracking-widest text-zinc-500">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`font-heading text-3xl font-bold ${color}`}>
              {value}
            </span>
            <span className="text-zinc-500 text-lg">{unit}</span>
          </div>
          <p className="text-sm text-zinc-500">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default KPICard
export { KPICard }