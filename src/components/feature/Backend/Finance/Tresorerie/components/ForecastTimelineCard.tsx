'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/atoms'
import { Card, CardContent } from '@/components/ui/molecules'
import { Calendar, TrendingUp, TrendingDown, AlertCircle, Clock, Sparkles } from 'lucide-react'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { TreasuryForecast } from '@/types/finance'
import { cn } from '@/lib/utils'

interface ForecastTimelineCardProps {
  forecast: TreasuryForecast
  onEdit?: (forecast: TreasuryForecast) => void
  onDelete?: (forecast: TreasuryForecast) => void
  className?: string
}

export default function ForecastTimelineCard({
  forecast,
  onEdit,
  onDelete,
  className = '',
}: ForecastTimelineCardProps) {
  const forecastDate = new Date(forecast.date)
  const daysUntil = differenceInDays(forecastDate, new Date())
  const isOverdue = isPast(forecastDate) && !isToday(forecastDate)
  const isUpcoming = daysUntil <= 7 && daysUntil >= 0

  const getTypeConfig = () => {
    switch (forecast.type) {
      case 'income':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'from-green-500/20 to-green-500/5',
          borderColor: 'border-l-green-500',
          glowColor: 'shadow-green-500/20',
          label: 'Entree prevue',
        }
      case 'expense':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bgColor: 'from-red-500/20 to-red-500/5',
          borderColor: 'border-l-red-500',
          glowColor: 'shadow-red-500/20',
          label: 'Sortie prevue',
        }
      default:
        return {
          icon: Calendar,
          color: 'text-zinc-500',
          bgColor: 'from-zinc-500/20 to-zinc-500/5',
          borderColor: 'border-l-zinc-500',
          glowColor: 'shadow-zinc-500/20',
          label: 'Prevision',
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  const getStatusBadge = () => {
    if (isOverdue) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 shadow-sm"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">En retard</span>
        </motion.div>
      )
    }
    if (isUpcoming) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 shadow-sm"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Imminent</span>
        </motion.div>
      )
    }
    if (isToday(forecastDate)) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Aujourd'hui</span>
        </motion.div>
      )
    }
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
      >
        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
          Dans {daysUntil}j
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        variant="outline"
        className={cn(
          "transition-all duration-200 cursor-pointer border-l-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
          config.borderColor,
          className
        )}
        onClick={() => onEdit?.(forecast)}
      >
        <CardContent className="p-4">
        <div className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn("p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50", config.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-label uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                {config.label}
              </p>
              <h4 className="font-semibold text-base text-foreground truncate" title={forecast.label}>
                {forecast.label}
              </h4>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="pt-3 mt-3 border-t border-border-custom">
          <div className="flex items-end justify-between mt-2">
            <div className="flex-1">
              <motion.p 
                className={cn("text-3xl font-bold font-mono", config.color)}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {forecast.type === 'income' ? '+' : '-'}
                {forecast.amount.toLocaleString('fr-FR')}
                <span className="text-sm ml-1.5 opacity-70">EUR</span>
              </motion.p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  {format(forecastDate, 'dd MMM yyyy', { locale: fr })}
                </p>
                {forecast.category && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                      {forecast.category}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Timeline visuelle améliorée */}
          <div className="mt-4 relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-500 rounded-full",
                isOverdue ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                isUpcoming ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                'bg-gradient-to-r from-zinc-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700'
              )}
              initial={{ width: 0 }}
              animate={{
                width: isOverdue ? '100%' : isUpcoming ? `${Math.max(10, ((7 - daysUntil) / 7) * 100)}%` : '0%'
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* Effet de brillance sur la barre */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>

          {forecast.notes && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 italic bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-border-custom">
              {forecast.notes}
            </p>
          )}
        </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
