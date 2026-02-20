import React from 'react';
import { cn } from '@/lib/utils';
import { EventStatus } from '@/types/event';

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, className }) => {
  const config = {
    idea: {
      label: 'Idée',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    },
    preparation: {
      label: 'Préparation',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    confirmed: {
      label: 'Confirmé',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    },
    completed: {
      label: 'Terminé',
      className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    },
    archived: {
      label: 'Archivé',
      className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    },
  }[status];

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", config.className, className)}>
      {config.label}
    </span>
  );
};
