'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import { IconButton } from './IconButton';
import { cn } from '@/lib/utils';

/** Attributs anti-autofill pour éviter que le navigateur propose email/mot de passe */
const ANTI_AUTOFILL_PROPS = {
  autoComplete: 'off' as const,
  'data-1p-ignore': true,
  'data-lpignore': 'true' as const,
  'data-form-type': 'other' as const,
};

export interface TokenInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  /** Masquer le contenu (points) — défaut true */
  masked?: boolean;
  /** Afficher le bouton œil pour toggle visibilité (si masked) */
  showToggle?: boolean;
}

export const TokenInput = React.forwardRef<HTMLInputElement, TokenInputProps>(
  ({ masked = true, showToggle = true, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    const inputProps = {
      ...props,
      ...ANTI_AUTOFILL_PROPS,
    };

    if (!masked) {
      return (
        <Input
          ref={ref}
          type="text"
          className={className}
          {...inputProps}
        />
      );
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(showToggle && 'pr-10', className)}
          {...inputProps}
        />
        {showToggle && (
          <IconButton
            type="button"
            icon={visible ? EyeOff : Eye}
            ariaLabel={visible ? 'Masquer le token' : 'Afficher le token'}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            onClick={() => setVisible(!visible)}
            tabIndex={-1}
          />
        )}
      </div>
    );
  }
);

TokenInput.displayName = 'TokenInput';
