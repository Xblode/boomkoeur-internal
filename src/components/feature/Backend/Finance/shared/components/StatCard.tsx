import { Card, CardContent } from '@/components/ui/molecules'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: string
  subtext?: string
  className?: string
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-zinc-900 dark:text-zinc-50',
  subtext,
  className = '',
}: StatCardProps) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-zinc-500 uppercase tracking-wider">{label}</p>
          {Icon && <Icon className={`w-5 h-5 ${color}`} />}
        </div>
        <p className={`text-2xl font-bold font-heading ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  )
}

export default StatCard
export { StatCard }