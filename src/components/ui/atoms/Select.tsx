import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, helperText, label, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            className={cn(
              "flex h-9 w-full appearance-none items-center justify-between rounded-md border bg-card-bg px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300 dark:bg-zinc-900 [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100",
              error 
                ? "border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500" 
                : "border-zinc-200 dark:border-zinc-800",
              className
            )}
            ref={ref}
            {...props}
          >
            {options ? (
              options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            ) : (
              children
            )}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
        {helperText && (
          <p className={cn(
            "mt-1.5 text-sm",
            error ? "text-red-500" : "text-zinc-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
