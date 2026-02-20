import React from 'react';
import Link, { LinkProps as NextLinkProps } from 'next/link';
import { cn } from '@/lib/utils';

export interface CustomLinkProps extends NextLinkProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'underline';
  isExternal?: boolean;
}

export const CustomLink = ({ className, children, variant = 'default', isExternal, ...props }: CustomLinkProps) => {
  const variants = {
    default: "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
    muted: "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
    underline: "text-zinc-900 dark:text-zinc-50 underline underline-offset-4 hover:decoration-2",
  };

  const content = (
    <span className={cn("cursor-pointer transition-colors", variants[variant], className)}>
      {children}
    </span>
  );

  if (isExternal) {
    return (
      <a 
        href={props.href.toString()} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn("cursor-pointer transition-colors", variants[variant], className)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link {...props} className={cn("no-underline", className)}>
      {content}
    </Link>
  );
};
