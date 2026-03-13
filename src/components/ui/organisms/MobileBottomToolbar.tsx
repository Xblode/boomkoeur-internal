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
import { useMessagesUnreadCount } from '@/hooks';

const TOOLBAR_HEIGHT = 64;

export function MobileBottomToolbar() {
  const pathname = usePathname();
  const { open } = useSearchModal();
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
          'h-[var(--mobile-toolbar-height,64px)]',
          'border-t border-border-custom bg-backend',
          'pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]'
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
          <span
            className={cn(
              'flex items-center justify-center rounded-lg px-3 py-2 transition-colors',
              isActive('/dashboard') ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''
            )}
          >
            <LayoutDashboard size={22} className="shrink-0" />
          </span>
        </Link>

        <button
          type="button"
          onClick={() => open()}
          aria-label="Rechercher"
          className="flex items-center justify-center flex-1 py-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
        >
          <Search size={22} className="shrink-0" />
        </button>

        <Link
          href="/dashboard/messages"
          aria-label="Messages"
          className={cn(
            'relative flex items-center justify-center flex-1 py-2 transition-colors',
            isActive('/dashboard/messages')
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-lg px-3 py-2 transition-colors',
              isActive('/dashboard/messages') ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''
            )}
          >
            <MessageSquare size={22} className="shrink-0" />
          </span>
          {messagesUnreadCount > 0 && (
            <span className="absolute top-1 right-1/2 translate-x-2 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
            </span>
          )}
        </Link>

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
          <span
            className={cn(
              'flex items-center justify-center rounded-lg px-3 py-2 transition-colors',
              isActive('/dashboard/events') ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''
            )}
          >
            <CalendarDays size={22} className="shrink-0" />
          </span>
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
          <span
            className={cn(
              'flex items-center justify-center rounded-lg px-3 py-2 transition-colors',
              isActive('/dashboard/calendar') ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''
            )}
          >
            <Calendar size={22} className="shrink-0" />
          </span>
        </Link>
      </nav>
    </>
  );
}

export const MOBILE_TOOLBAR_HEIGHT = TOOLBAR_HEIGHT;
