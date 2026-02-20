import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          className={cn(
            "peer h-4 w-4 aspect-square rounded-full border border-zinc-200 text-zinc-900 shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-50 dark:focus-visible:ring-zinc-300 appearance-none checked:border-zinc-900 dark:checked:border-zinc-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-50 hidden peer-checked:block pointer-events-none" />
      </div>
    );
  }
);
Radio.displayName = "Radio";
