import type { TreasuryForecast } from '@/types/finance'

interface ForecastCardProps {
  forecast: TreasuryForecast
  className?: string
}

export default function ForecastCard({ forecast, className = '' }: ForecastCardProps) {
  const getCertaintyLabel = () => {
    switch (forecast.certainty_level) {
      case 'confirmed':
        return '✅ Confirme'
      case 'probable':
        return '🟡 Probable'
      default:
        return '❓ Incertain'
    }
  }

  const getCertaintyStyle = () => {
    switch (forecast.certainty_level) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400'
      case 'probable':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div
      className={`p-4 border-2 border-border-custom rounded-lg hover:border-accent/50 transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-heading text-sm font-bold mb-1">{forecast.label}</div>
          <div className="text-xs text-zinc-500">
            {new Date(forecast.date).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-heading uppercase rounded border ${
            forecast.type === 'income'
              ? 'bg-green-500/20 text-green-400 border-green-500/50'
              : 'bg-red-500/20 text-red-400 border-red-500/50'
          }`}
        >
          {forecast.type === 'income' ? 'Entree' : 'Sortie'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div
          className={`text-lg font-mono font-bold ${
            forecast.type === 'income' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {forecast.type === 'income' ? '+' : '-'}
          {(forecast.amount || 0).toLocaleString('fr-FR')} EUR
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getCertaintyStyle()}`}>
          {getCertaintyLabel()}
        </span>
      </div>
    </div>
  )
}

