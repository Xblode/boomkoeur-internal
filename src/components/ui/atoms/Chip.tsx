import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onDelete?: () => void;
  variant?: 'default' | 'outline';
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, label, onDelete, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
      outline: "border border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-50",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        <span>{label}</span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 rounded-full p-0.5 hover:bg-zinc-300/50 dark:hover:bg-zinc-600/50"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = "Chip";
