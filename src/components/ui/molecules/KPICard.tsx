'use client';

import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  subtext?: string;
  tooltip?: string;
  className?: string;
}

export function KPICard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  subtext,
  tooltip,
  className = '',
}: KPICardProps) {
  return (
    <Card variant="outline" className={className}>
      <CardContent className="p-2 sm:p-4 space-y-0.5 sm:space-y-1">
      <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-500">
        {Icon && (
          tooltip ? (
            <div className="group/icon relative">
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0 cursor-help" />
              <div className="absolute left-0 top-full mt-1 hidden group-hover/icon:block z-50 pointer-events-none">
                <div className="bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl min-w-[200px] max-w-xs text-sm text-foreground whitespace-normal">
                  {tooltip}
                </div>
              </div>
            </div>
          ) : (
            <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0" />
          )
        )}
        <span className="text-[10px] sm:text-xs">{label}</span>
      </div>
      <p className="text-base sm:text-xl font-bold tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        {unit != null && unit !== '' && <span className="text-xs sm:text-sm ml-0.5 sm:ml-1 text-zinc-500">{unit}</span>}
      </p>
      {trend !== undefined && trendLabel && (
        <p className="text-[10px] sm:text-[11px] text-zinc-400 flex items-center gap-1">
          <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>{' '}
          {trendLabel}
        </p>
      )}
      {subtext && !(trend !== undefined && trendLabel) && (
        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 line-clamp-1">{subtext}</p>
      )}
      </CardContent>
    </Card>
  );
}
