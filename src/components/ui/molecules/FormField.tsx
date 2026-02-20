import React from 'react';
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  inputProps?: Omit<InputProps, 'error'>;
  className?: string;
  description?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  htmlFor,
  inputProps,
  className = '',
  description,
  children,
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children ?? (
        <Input
          id={htmlFor}
          error={error}
          fullWidth
          {...inputProps}
        />
      )}
      {description && !error && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-red-500 dark:text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
};
