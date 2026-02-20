import { Card, CardContent } from '@/components/ui/molecules'
import ProgressBar from './ProgressBar'
import { StatusBadge } from '../../shared/components'

interface BudgetCategoryCardProps {
  category: string
  allocated: number
  spent: number
  remaining: number
  percentage: number
  className?: string
}

export default function BudgetCategoryCard({
  category,
  allocated,
  spent,
  remaining,
  percentage,
  className = '',
}: BudgetCategoryCardProps) {
  const getStatusVariant = () => {
    if (percentage > 100) return 'danger'
    if (percentage > 80) return 'warning'
    return 'success'
  }

  const getStatusLabel = () => {
    if (percentage > 100) return '🔴 Depasse'
    if (percentage > 80) return '🟡 Attention'
    return '🟢 OK'
  }

  const getProgressColor = (): 'green' | 'yellow' | 'red' => {
    if (percentage > 100) return 'red'
    if (percentage > 80) return 'yellow'
    return 'green'
  }

  return (
    <Card className={`hover:border-accent/50 transition-all ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading text-lg font-bold">{category}</h3>
          <StatusBadge label={getStatusLabel()} variant={getStatusVariant()} />
        </div>

        <div className="space-y-3">
          <ProgressBar
            value={spent}
            max={allocated}
            color={getProgressColor()}
            height="md"
          />

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase">Alloue</p>
              <p className="font-mono font-bold text-zinc-600 dark:text-zinc-400">
                {allocated.toLocaleString('fr-FR')}EUR
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase">Depense</p>
              <p className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
                {spent.toLocaleString('fr-FR')}EUR
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase">Restant</p>
              <p className={`font-mono font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {remaining.toLocaleString('fr-FR')}EUR
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

