import React from 'react';
import { Label, LabelProps } from './Label';
import { cn } from '@/lib/utils';

const formLabelStyles = 'block font-label text-[10px] uppercase tracking-widest text-zinc-500 mb-3';

export interface FormLabelProps extends LabelProps {}

/**
 * Label stylisé pour les formulaires (champs, sections).
 * Utilise une typographie compacte et discrète.
 */
export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn(formLabelStyles, className)}
        {...props}
      />
    );
  }
);

FormLabel.displayName = 'FormLabel';
