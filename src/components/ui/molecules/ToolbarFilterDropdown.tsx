'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/atoms';

export interface ToolbarFilterDropdownProps {
  label?: string;
  activeCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function getDropdownPosition(ref: React.RefObject<HTMLButtonElement | null | undefined>) {
  if (!ref.current) return { top: 0, left: 0 };
  const rect = ref.current.getBoundingClientRect();
  return {
    top: rect.bottom + 4,
    left: rect.left,
  };
}

/**
 * ToolbarFilterDropdown - Bouton filtre avec dropdown pour la toolbar
 *
 * Affiche un bouton "Filtres" avec badge de compteur optionnel.
 * Le contenu du dropdown est fourni via children (Input, Select, etc.).
 */
export function ToolbarFilterDropdown({
  label = 'Filtres',
  activeCount = 0,
  open,
  onOpenChange,
  children,
  className,
}: ToolbarFilterDropdownProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-filter-dropdown]')) return;
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        onOpenChange(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  return (
    <div className={cn('relative', className)}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="xs"
        onClick={() => onOpenChange(!open)}
        className="focus:border-accent"
      >
        <Filter className="w-3 h-3" />
        {label}
        {activeCount > 0 && (
          <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={14}
          className={cn('w-3 h-3 transition-transform shrink-0', open && 'rotate-180')}
        />
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => onOpenChange(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[var(--z-dropdown-panel)] bg-card-bg border border-border-custom rounded shadow-lg min-w-[280px] max-w-[400px] max-h-[500px] overflow-y-auto p-4"
              style={getDropdownPosition(buttonRef)}
              data-filter-dropdown
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
