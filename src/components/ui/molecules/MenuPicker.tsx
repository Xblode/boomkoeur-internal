'use client';

import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface MenuPickerItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

export interface MenuPickerProps {
  /** Élément déclencheur (bouton, icône, etc.) */
  trigger: React.ReactNode;
  /** Options du menu */
  items: MenuPickerItem[];
  /** Contenu affiché au-dessus des items (avec divider en dessous) */
  header?: React.ReactNode;
  /** Alignement du panneau par rapport au trigger */
  align?: 'start' | 'center' | 'end';
  /** Côté d'ouverture */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Classes du contenu */
  contentClassName?: string;
  /** Fermer après un clic sur un item */
  closeOnSelect?: boolean;
}

export function MenuPicker({
  trigger,
  items,
  header,
  align = 'end',
  side = 'bottom',
  contentClassName,
  closeOnSelect = true,
}: MenuPickerProps) {
  const [open, setOpen] = useState(false);

  const handleItemClick = (item: MenuPickerItem) => {
    if (item.disabled) return;
    item.onClick();
    if (closeOnSelect) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={4}
        className={cn('w-auto min-w-[160px] p-0 border-0', contentClassName)}
      >
        <div className="flex flex-col">
          {header && (
            <div className="px-2.5 py-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {header}
            </div>
          )}
          {items.map((item) => {
            const Icon = item.icon;
            const isDestructive = item.variant === 'destructive';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-md transition-colors text-left',
                  'min-h-[44px] px-5 py-3.5 text-base sm:min-h-0 sm:px-3 sm:py-2 sm:text-sm',
                  item.disabled && 'opacity-50 cursor-not-allowed',
                  !item.disabled && isDestructive && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30',
                  !item.disabled && !isDestructive && 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                {Icon && <Icon className="shrink-0 w-[18px] h-[18px] sm:w-3.5 sm:h-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
