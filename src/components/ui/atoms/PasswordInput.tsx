'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import { IconButton } from './IconButton';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  /** Afficher le bouton œil pour toggle visibilité */
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(showToggle && 'pr-10', className)}
          {...props}
        />
        {showToggle && (
          <IconButton
            type="button"
            icon={visible ? EyeOff : Eye}
            ariaLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
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

PasswordInput.displayName = 'PasswordInput';
