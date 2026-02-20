import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, fullWidth = false, className = '', disabled, ...props }, ref) => {
    // Design minimaliste : bordure fine, focus subtil
    const baseStyles = 'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1';
    
    const normalStyles = 'border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300';
    const errorStyles = 'border-red-500 focus-visible:ring-red-500 text-red-600 dark:border-red-900 dark:text-red-500';
    const widthStyle = fullWidth ? 'w-full' : '';
    
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${error ? errorStyles : normalStyles} ${widthStyle} ${className}`}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
