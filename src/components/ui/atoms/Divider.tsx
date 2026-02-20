import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  text?: string;
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = 'horizontal', text, ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          className={cn(
            "inline-block h-full w-px bg-zinc-200 dark:bg-zinc-800 mx-2 self-stretch",
            className
          )}
        />
      );
    }

    if (text) {
      return (
        <div className={cn("relative flex items-center w-full", className)}>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-zinc-500 uppercase">{text}</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>
      );
    }

    return (
      <hr
        ref={ref}
        className={cn("shrink-0 bg-zinc-200 border-none h-px w-full my-4 dark:bg-zinc-800", className)}
        {...props}
      />
    );
  }
);
Divider.displayName = "Divider";
