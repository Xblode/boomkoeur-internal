'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/atoms';

export interface EntitySelectorDropdownProps<T> {
  value: T | null | undefined;
  options: T[];
  onSelect: (value: T) => void;
  renderOption?: (option: T) => React.ReactNode;
  renderValue?: (value: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
}

/**
 * EntitySelectorDropdown - Dropdown pour sélectionner une entité
 *
 * Utilisé dans la sidebar pour sélectionner un événement, une année,
 * un produit, une réunion, etc.
 */
export function EntitySelectorDropdown<T>({
  value,
  options,
  onSelect,
  renderOption,
  renderValue,
  placeholder = 'Sélectionner',
  className,
}: EntitySelectorDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayValue = value != null && renderValue ? renderValue(value) : value != null ? String(value) : '';
  const isPlaceholder = value == null;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full justify-between font-bold text-sm',
          isPlaceholder && 'text-zinc-500'
        )}
      >
        <span className="truncate">{isPlaceholder ? placeholder : displayValue}</span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')}
        />
      </Button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-full bg-card-bg border border-border-custom rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
              className={cn(
                'w-full justify-start font-normal',
                value != null && option === value && 'bg-zinc-100 dark:bg-zinc-800'
              )}
            >
              {renderOption ? renderOption(option) : String(option)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
