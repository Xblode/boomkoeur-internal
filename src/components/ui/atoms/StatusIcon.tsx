import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type StatusIconShape = 'circle' | 'square';
export type StatusIconVariant = 'not_started' | 'active' | 'done';

export interface StatusIconProps {
  shape?: StatusIconShape;
  variant?: StatusIconVariant;
  progress?: number;
  className?: string;
}

export function StatusIcon({
  shape = 'circle',
  variant = 'not_started',
  progress = 0,
  className,
}: StatusIconProps) {
  const isDiamond = shape === 'square';
  const baseClasses = cn(
    'relative shrink-0 flex items-center justify-center transition-all',
    'w-[14px] h-[14px]',
    isDiamond ? 'rotate-45 rounded-[2.5px]' : 'rounded-full',
    className
  );

  if (variant === 'not_started') {
    return (
      <div className={cn(baseClasses, 'border-[1.5px] border-dashed border-current bg-transparent')} />
    );
  }

  if (variant === 'active') {
    return (
      <div className={cn(baseClasses, 'border-[1.5px] border-solid border-current bg-transparent')}>
        <div 
          className={cn('w-[8px] h-[8px]', isDiamond ? 'rounded-[1px]' : 'rounded-full')}
          style={{
            background: `conic-gradient(currentColor ${progress}%, transparent 0)`
          }}
        />
      </div>
    );
  }

  if (variant === 'done') {
    return (
      <div className={cn(baseClasses, 'bg-current')}>
        <Check 
          className={cn('w-2.5 h-2.5 shrink-0 text-zinc-900', isDiamond && '-rotate-45')} 
          strokeWidth={3.5} 
        />
      </div>
    );
  }

  return null;
}