'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useOrg } from './OrgProvider';

/**
 * Redirige les utilisateurs démo vers le dashboard.
 * À utiliser dans les layouts des pages à restreindre (settings, profile, admin).
 */
export function DemoGuard({ children }: { children: ReactNode }) {
  const { activeOrg, isLoading } = useOrg();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && activeOrg?.slug === 'demo') {
      router.replace('/dashboard');
    }
  }, [activeOrg?.slug, isLoading, router]);

  if (isLoading || activeOrg?.slug === 'demo') {
    return null;
  }

  return <>{children}</>;
}
