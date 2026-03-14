'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  CalendarDays,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchModal } from '@/components/providers/SearchModalProvider';
import { useMessagesDrawer } from '@/components/providers/MessagesDrawerProvider';
import { useMessagesUnreadCount } from '@/hooks';

/** Hauteur totale de la toolbar (sync avec le padding du layout) — pt-3 + contenu + pb-8 ≈ 88px */
export const MOBILE_TOOLBAR_HEIGHT_PX = 88;

export function MobileBottomToolbar() {
  const pathname = usePathname();
  const { open } = useSearchModal();
  const { open: openMessagesDrawer, isOpen: isMessagesDrawerOpen } = useMessagesDrawer();
  const { count: messagesUnreadCount } = useMessagesUnreadCount();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || (pathname?.startsWith(href) ?? false);
  };

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
          'flex items-center justify-around px-4',
          'min-h-[var(--mobile-toolbar-height,64px)]',
          'border-t border-border-custom bg-backend',
          'pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]'
        )}
        aria-label="Navigation principale"
      >
        <Link
          href="/dashboard"
          aria-label="Dashboard"
          className={cn(
            'relative flex items-center justify-center flex-1 py-2 transition-colors',
            isActive('/dashboard')
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
          )}
        >
          <LayoutDashboard
            size={22}
            className="shrink-0"
            fill={isActive('/dashboard') ? 'currentColor' : 'none'}
            strokeWidth={isActive('/dashboard') ? 2.5 : 1.5}
          />
        </Link>

        <button
          type="button"
          onClick={() => open()}
          aria-label="Rechercher"
          className="flex items-center justify-center flex-1 py-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
        >
          <Search size={22} className="shrink-0" />
        </button>

        <button
          type="button"
          onClick={openMessagesDrawer}
          aria-label="Messages"
          className={cn(
            'relative flex items-center justify-center flex-1 py-2 transition-colors',
            isMessagesDrawerOpen
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
          )}
        >
          <MessageSquare
            size={22}
            className="shrink-0"
            fill={isMessagesDrawerOpen ? 'currentColor' : 'none'}
            strokeWidth={isMessagesDrawerOpen ? 2.5 : 1.5}
          />
          {messagesUnreadCount > 0 && (
            <span className="absolute top-1 right-1/2 translate-x-2 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
            </span>
          )}
        </button>

        <Link
          href="/dashboard/events"
          aria-label="Events"
          className={cn(
            'relative flex items-center justify-center flex-1 py-2 transition-colors',
            isActive('/dashboard/events')
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
          )}
        >
          <CalendarDays
            size={22}
            className="shrink-0"
            fill={isActive('/dashboard/events') ? 'currentColor' : 'none'}
            strokeWidth={isActive('/dashboard/events') ? 2.5 : 1.5}
          />
        </Link>

        <Link
          href="/dashboard/calendar"
          aria-label="Calendrier"
          className={cn(
            'relative flex items-center justify-center flex-1 py-2 transition-colors',
            isActive('/dashboard/calendar')
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
          )}
        >
          <Calendar
            size={22}
            className="shrink-0"
            fill={isActive('/dashboard/calendar') ? 'currentColor' : 'none'}
            strokeWidth={isActive('/dashboard/calendar') ? 2.5 : 1.5}
          />
        </Link>
      </nav>
    </>
  );
}

