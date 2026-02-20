import { Card, CardContent } from '@/components/ui/molecules'
import type { TreasuryForecast } from '@/types/finance'
import ForecastCard from './ForecastCard'
import { LoadingState, EmptyState } from '@/components/feature/Backend/Finance/shared/components'

interface ForecastsGridProps {
  forecasts: TreasuryForecast[]
  loading: boolean
  maxVisible?: number
  className?: string
}

export default function ForecastsGrid({ 
  forecasts, 
  loading, 
  maxVisible = 6,
  className = '' 
}: ForecastsGridProps) {
  const visibleForecasts = forecasts.slice(0, maxVisible)
  const remainingCount = forecasts.length - maxVisible

  if (forecasts.length === 0 && !loading) {
    return (
      <div className={className}>
        <EmptyState
          title="Aucune prevision pour le moment"
          description="Ajoutez vos entrees et sorties prevues pour anticiper votre tresorerie"
        />
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-8">
        {loading ? (
          <LoadingState message="Chargement des previsions..." />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleForecasts.map((forecast) => (
                <ForecastCard key={forecast.id} forecast={forecast} />
              ))}
            </div>
            {remainingCount > 0 && (
              <div className="text-center text-sm text-zinc-500">
                + {remainingCount} autre(s) prevision(s)
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
