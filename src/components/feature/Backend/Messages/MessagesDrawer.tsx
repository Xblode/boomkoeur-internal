'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MessageSquare, FileText } from 'lucide-react';
import { useMessagesDrawer } from '@/components/providers/MessagesDrawerProvider';
import { PageLayoutProvider } from '@/components/providers/PageLayoutProvider';
import { MessagesLayout } from './MessagesLayout';
import { cn } from '@/lib/utils';

/**
 * MessagesDrawer - Panneau Messages qui slide depuis la droite sur mobile.
 * Swipe gauche→droite pour fermer.
 */
export function MessagesDrawer() {
  const { isOpen, close } = useMessagesDrawer();
  const [view, setView] = useState<'messages' | 'journal'>('messages');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const pathnameOverride = view === 'journal' ? '/dashboard/messages/journal' : '/dashboard/messages';

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
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm lg:!hidden"
            onClick={close}
            aria-hidden="true"
          />
          {/* Drawer - slide depuis la droite */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 500 }}
            dragElastic={{ left: 0, right: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80 || info.velocity.x > 300) close();
            }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-[71] w-full max-w-[100vw] sm:max-w-md',
              'bg-backend flex flex-col shadow-2xl lg:hidden touch-pan-y',
              'safe-area-padding-bottom'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — même hauteur que le header principal (52px) */}
            <div className="flex items-center h-[52px] px-3 border-b border-border-custom shrink-0 bg-backend">
              <button
                type="button"
                onClick={close}
                className="p-2 -m-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                aria-label="Fermer"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex-1 flex justify-center min-w-0">
                <div className="flex rounded-md bg-zinc-100 dark:bg-zinc-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setView('messages')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-colors',
                      view === 'messages'
                        ? 'bg-backend text-foreground shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400'
                    )}
                  >
                    <MessageSquare size={14} />
                    Messages
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('journal')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-colors',
                      view === 'journal'
                        ? 'bg-backend text-foreground shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400'
                    )}
                  >
                    <FileText size={14} />
                    Journal
                  </button>
                </div>
              </div>
              <div className="w-10 shrink-0" aria-hidden />
            </div>
            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <PageLayoutProvider>
                <MessagesLayout pathnameOverride={pathnameOverride} className="h-full" />
              </PageLayoutProvider>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
