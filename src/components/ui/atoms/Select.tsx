import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  error?: boolean;
  helperText?: string;
  label?: string;
  options?: { value: string; label: string }[];
  /** default = standard, sm = compact, xs = toolbar */
  size?: 'default' | 'sm' | 'xs';
}

const selectBase =
  'w-full appearance-none rounded-md border bg-transparent placeholder:text-zinc-500 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, helperText, label, options, size = 'default', ...props }, ref) => {
    const isXs = size === 'xs';
    const isSm = size === 'sm';

    const selectStyles = isXs
      ? cn(
          selectBase,
          "flex h-6 items-center px-2 py-0.5 text-xs pr-7 placeholder:text-zinc-500 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300",
          error ? "border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800"
        )
      : isSm
        ? cn(
            selectBase,
            "flex h-8 items-center px-2.5 py-1 text-xs pr-8 placeholder:text-zinc-500 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300",
            error ? "border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800"
          )
        : cn(
            selectBase,
            "flex h-10 items-center justify-between px-3 py-2 text-sm pr-8 placeholder:text-zinc-500 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300",
            error ? "border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500" : "border-zinc-200 dark:border-zinc-800"
          );

    return (
      <div className={cn('w-full', (isSm || isXs) && 'min-w-0')}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            className={cn(selectStyles, className)}
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
          <ChevronDown className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-50 pointer-events-none shrink-0",
            isXs ? "right-1.5 h-3.5 w-3.5" : "right-2.5 h-4 w-4"
          )} />
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
