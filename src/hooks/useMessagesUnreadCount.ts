'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getOrCreateGeneralConversation, getUnreadCount } from '@/lib/supabase/messages';
import { useOrgOptional } from '@/components/providers/OrgProvider';

export function useMessagesUnreadCount() {
  const pathname = usePathname();
  const orgId = useOrgOptional()?.activeOrg?.id ?? null;
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!orgId || pathname === '/dashboard/messages') {
      setCount(0);
      return;
    }
    try {
      const conv = await getOrCreateGeneralConversation(orgId);
      const n = await getUnreadCount(conv.id);
      setCount(n);
    } catch {
      setCount(0);
    }
  }, [orgId, pathname]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (pathname === '/dashboard/messages') return;
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [pathname, refresh]);

  useEffect(() => {
    const onFocus = () => pathname !== '/dashboard/messages' && refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [pathname, refresh]);

  // Pastille sur l'icône PWA de l'écran d'accueil (Badging API)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('setAppBadge' in navigator)) return;
    if (count > 0) {
      navigator.setAppBadge(count).catch(() => {});
    } else {
      navigator.clearAppBadge?.().catch(() => {});
    }
    return () => {
      navigator.clearAppBadge?.().catch(() => {});
    };
  }, [count]);

  return { count, refresh };
}
