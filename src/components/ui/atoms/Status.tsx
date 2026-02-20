import React from 'react';
import { cn } from '@/lib/utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, color = 'bg-zinc-100', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium text-zinc-900 dark:text-zinc-100",
          color,
          className
        )}
        {...props}
      >
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 opacity-50" />
        {children}
      </span>
    );
  }
);
Tag.displayName = "Tag";

export interface DotProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  animate?: boolean;
}

export const Dot = React.forwardRef<HTMLSpanElement, DotProps>(
  ({ className, variant = 'neutral', animate = false, ...props }, ref) => {
    const colors = {
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      neutral: "bg-zinc-400",
    };

    return (
      <span className="relative flex h-2.5 w-2.5">
        {animate && (
          <span 
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              colors[variant]
            )} 
          />
        )}
        <span 
          ref={ref} 
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            colors[variant],
            className
          )}
          {...props}
        />
      </span>
    );
  }
);
Dot.displayName = "Dot";
