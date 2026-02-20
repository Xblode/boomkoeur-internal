import { Card, CardContent, CardHeader } from '@/components/ui/molecules'
import { LucideIcon } from 'lucide-react'

interface SummaryItem {
  label: string
  value: number
  color?: string
}

interface FinancialSummaryCardProps {
  title: string
  icon?: LucideIcon
  items: SummaryItem[]
  total?: {
    label: string
    value: number
    color?: string
  }
  className?: string
}

export default function FinancialSummaryCard({
  title,
  icon: Icon,
  items,
  total,
  className = '',
}: FinancialSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b-2 border-border-custom">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-zinc-900 dark:text-zinc-50" />}
          <h3 className="font-heading text-xl font-bold uppercase">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-border-custom last:border-0">
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
              <span className={`font-mono font-bold ${item.color || 'text-foreground'}`}>
                {item.value.toLocaleString('fr-FR')} EUR
              </span>
            </div>
          ))}
          {total && (
            <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-accent">
              <span className="font-heading text-lg font-bold uppercase">{total.label}</span>
              <span className={`font-mono text-xl font-bold ${total.color || 'text-zinc-900 dark:text-zinc-50'}`}>
                {total.value.toLocaleString('fr-FR')} EUR
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

