'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Info, AlertTriangle, Circle } from 'lucide-react';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'default';

export interface StatusBadgeProps {
  label: string;
  variant: StatusBadgeVariant;
  className?: string;
  showIcon?: boolean;
  pulse?: boolean;
}

const variantConfig: Record<
  StatusBadgeVariant,
  { styles: string; icon: typeof Check; pulseColor: string }
> = {
  success: {
    styles: 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-500 border-green-500/30 shadow-green-500/10',
    icon: Check,
    pulseColor: 'bg-green-500/50',
  },
  warning: {
    styles: 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-yellow-500/10',
    icon: AlertTriangle,
    pulseColor: 'bg-yellow-500/50',
  },
  danger: {
    styles: 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-500 border-red-500/30 shadow-red-500/10',
    icon: AlertCircle,
    pulseColor: 'bg-red-500/50',
  },
  info: {
    styles: 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-500 border-blue-500/30 shadow-blue-500/10',
    icon: Info,
    pulseColor: 'bg-blue-500/50',
  },
  neutral: {
    styles: 'bg-gradient-to-r from-zinc-500/20 to-zinc-500/10 text-zinc-500 border-zinc-500/30',
    icon: Circle,
    pulseColor: 'bg-zinc-500/50',
  },
  default: {
    styles: 'bg-gradient-to-r from-zinc-500/20 to-zinc-500/10 text-zinc-500 border-zinc-500/30',
    icon: Circle,
    pulseColor: 'bg-zinc-500/50',
  },
};

export function StatusBadge({
  label,
  variant,
  className = '',
  showIcon = true,
  pulse = false,
}: StatusBadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-full shadow-sm relative overflow-hidden',
        config.styles,
        className
      )}
    >
      {pulse && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className={cn('absolute h-full w-full rounded-full animate-ping opacity-30', config.pulseColor)} />
        </span>
      )}
      {showIcon && <Icon className="w-3 h-3 relative z-10" />}
      <span className="relative z-10 uppercase tracking-wide">{label}</span>
    </motion.span>
  );
}
