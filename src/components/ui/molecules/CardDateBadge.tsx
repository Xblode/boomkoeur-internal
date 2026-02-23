'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/atoms';

export interface CardDateBadgeProps {
  /** Mois abrégé (ex: "Mar", "Fév") - optionnel en mode skeleton */
  month?: string;
  /** Jour (ex: "21", "19") - optionnel en mode skeleton */
  day?: string;
  /** Mode skeleton pour les états de chargement */
  skeleton?: boolean;
  className?: string;
}

const baseClasses =
  'flex-shrink-0 flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-[3.5rem] bg-zinc-800 border border-zinc-700';

export function CardDateBadge({ month, day, skeleton, className }: CardDateBadgeProps) {
  if (skeleton) {
    return (
      <div className={cn(baseClasses, className)}>
        <Skeleton className="h-3 w-8 rounded !bg-zinc-700" />
        <Skeleton className="h-7 w-8 rounded mt-2 !bg-zinc-700" />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, className)}>
      <span className="text-xs font-medium text-zinc-400 uppercase">{month}</span>
      <span className="text-2xl font-bold text-white leading-none mt-0.5">{day}</span>
    </div>
  );
}
