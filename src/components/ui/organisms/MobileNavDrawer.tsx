'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/atoms';
import { useMobileNav } from '@/components/providers/MobileNavProvider';
import { cn } from '@/lib/utils';
import type { SidebarItem } from './Sidebar';

export interface MobileNavDrawerProps {
  items: SidebarItem[];
  className?: string;
}

/**
 * MobileNavDrawer - Drawer de navigation mobile
 * Affiche le contenu de la sidebar principale dans un drawer qui slide depuis la gauche.
 */
export function MobileNavDrawer({ items, className }: MobileNavDrawerProps) {
  const { isOpen, close } = useMobileNav();
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  // Fermer au changement de route (navigation)
  useEffect(() => {
    close();
  }, [pathname, close]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={close}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed left-0 top-0 bottom-0 z-[61] w-[min(280px,85vw)] border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-backend flex flex-col lg:hidden',
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du drawer */}
            <div className="flex items-center justify-between h-[52px] px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <span className="font-semibold text-sm">Menu</span>
              <IconButton
                icon={X}
                ariaLabel="Fermer le menu"
                variant="ghost"
                size="sm"
                onClick={close}
                className="p-2 rounded-lg"
              />
            </div>
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                      )}
                    >
                      {item.icon && <item.icon size={20} className="shrink-0" />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
