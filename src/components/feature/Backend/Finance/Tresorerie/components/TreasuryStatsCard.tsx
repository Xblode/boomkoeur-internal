'use client'

import { Card, CardContent } from '@/components/ui/molecules'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface SparklineData {
  value: number
}

interface TreasuryStatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  sparklineData?: SparklineData[]
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  unit?: string
  subtitle?: string
  className?: string
}

export default function TreasuryStatsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  sparklineData = [],
  variant = 'default',
  unit = 'EUR',
  subtitle,
  className = '',
}: TreasuryStatsCardProps) {
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-500/5',
          border: 'border-green-500/20',
          text: 'text-green-400',
          sparkline: '#22c55e',
          icon: 'text-green-400'
        }
      case 'danger':
        return {
          bg: 'bg-red-500/5',
          border: 'border-red-500/20',
          text: 'text-red-400',
          sparkline: '#ef4444',
          icon: 'text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/5',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          sparkline: '#eab308',
          icon: 'text-yellow-400'
        }
      case 'info':
        return {
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/20',
          text: 'text-blue-400',
          sparkline: '#3b82f6',
          icon: 'text-blue-400'
        }
      default:
        return {
          bg: 'bg-accent/5',
          border: 'border-accent/20',
          text: 'text-zinc-900 dark:text-zinc-50',
          sparkline: '#FF5500',
          icon: 'text-zinc-900 dark:text-zinc-50'
        }
    }
  }

  const colors = getVariantColors()

  return (
    <Card 
      className={`${className} ${colors.bg} ${colors.border} hover:border-accent/50 transition-all duration-300 group`}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-label uppercase tracking-wider text-zinc-500 mb-1">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold font-heading ${colors.text}`}>
                {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
              </p>
              {unit && (
                <span className={`text-lg font-label ${colors.text} opacity-70`}>{unit}</span>
              )}
            </div>
          </div>
          
          <div className={`${colors.icon} transition-transform group-hover:scale-110 duration-300`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-mono font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-zinc-500">{trendLabel}</span>
            )}
          </div>
        )}

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="h-12 -mx-2 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.sparkline} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.sparkline} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.sparkline}
                  strokeWidth={2}
                  fill={`url(#gradient-${label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-2 border-t border-border-custom pt-2">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

