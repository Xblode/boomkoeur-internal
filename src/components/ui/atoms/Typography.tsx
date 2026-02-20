import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  asChild?: boolean;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : `h${level}`;
    
    const sizes = {
      1: "text-4xl font-extrabold tracking-tight lg:text-5xl",
      2: "text-3xl font-semibold tracking-tight first:mt-0",
      3: "text-2xl font-semibold tracking-tight",
      4: "text-xl font-semibold tracking-tight",
      5: "text-lg font-semibold tracking-tight",
      6: "text-base font-semibold tracking-tight",
    };

    return (
      <Comp
        ref={ref}
        className={cn("scroll-m-20 text-foreground", sizes[level], className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'lead' | 'large' | 'small' | 'muted';
  asChild?: boolean;
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "p";
    
    const variants = {
      default: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-zinc-500 dark:text-zinc-400",
      large: "text-lg font-semibold text-foreground",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-zinc-500 dark:text-zinc-400",
    };

    return (
      <Comp
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";
