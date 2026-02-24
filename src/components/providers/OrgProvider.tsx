'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Organisation, OrgRole } from '@/types/organisation';
import { getUserOrganisations, getUserRoleInOrg } from '@/lib/supabase/organisations';
import { useUser } from '@/hooks';
import { userService } from '@/lib/services/UserService';
import { setActiveOrgId } from '@/lib/supabase/activeOrg';

const ACTIVE_ORG_KEY = 'active_org_id';

interface OrgContextType {
  activeOrg: Organisation | null;
  userOrgs: Organisation[];
  userRole: OrgRole | null;
  isLoading: boolean;
  switchOrg: (orgId: string) => void;
  refreshOrgs: () => Promise<void>;
  isAdmin: boolean;
  isFounder: boolean;
  isSuperAdmin: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [userOrgs, setUserOrgs] = useState<Organisation[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organisation | null>(null);
  const [userRole, setUserRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrgs = useCallback(async () => {
    if (!user) {
      setUserOrgs([]);
      setActiveOrg(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const orgs = await getUserOrganisations();
      setUserOrgs(orgs);

      if (orgs.length === 0) {
        setActiveOrg(null);
        setUserRole(null);
        setIsLoading(false);
        if (pathname?.startsWith('/dashboard')) {
          router.push('/onboarding');
        }
        return;
      }

      const savedId = localStorage.getItem(ACTIVE_ORG_KEY);
      const saved = savedId ? orgs.find((o) => o.id === savedId) : null;
      const selected = saved ?? orgs[0];

      setActiveOrg(selected);
      localStorage.setItem(ACTIVE_ORG_KEY, selected.id);
      userService.setOrgId(selected.id);
      setActiveOrgId(selected.id);

      const role = await getUserRoleInOrg(selected.id);
      setUserRole(role);
    } catch {
      setUserOrgs([]);
      setActiveOrg(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, pathname, router]);

  useEffect(() => {
    if (!userLoading) {
      loadOrgs();
    }
  }, [userLoading, loadOrgs]);

  const switchOrg = useCallback(async (orgId: string) => {
    const org = userOrgs.find((o) => o.id === orgId);
    if (!org) return;

    setActiveOrg(org);
    localStorage.setItem(ACTIVE_ORG_KEY, orgId);
    userService.setOrgId(orgId);
    setActiveOrgId(orgId);

    const role = await getUserRoleInOrg(orgId);
    setUserRole(role);
  }, [userOrgs]);

  const isSuperAdmin = user?.id ? false : false;
  const isFounder = userRole === 'fondateur';
  const isAdmin = userRole === 'admin' || userRole === 'fondateur' || isSuperAdmin;

  return (
    <OrgContext.Provider
      value={{
        activeOrg,
        userOrgs,
        userRole,
        isLoading,
        switchOrg,
        refreshOrgs: loadOrgs,
        isAdmin,
        isFounder,
        isSuperAdmin,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
