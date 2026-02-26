'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Organisation, OrgRole } from '@/types/organisation';
import { getUserOrganisations, getUserRoleInOrg } from '@/lib/supabase/organisations';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks';
import { userService } from '@/lib/services/UserService';
import { setActiveOrgId, setActiveOrgSlug } from '@/lib/supabase/activeOrg';

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrgs = useCallback(async () => {
    if (!user) {
      setUserOrgs([]);
      setActiveOrg(null);
      setUserRole(null);
      setIsSuperAdmin(false);
      setIsLoading(false);
      setActiveOrgSlug(null);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single();
      const superAdmin = profile?.is_super_admin ?? false;
      setIsSuperAdmin(superAdmin);

      const orgs = await getUserOrganisations(user.id);
      setUserOrgs(orgs);

      if (orgs.length === 0) {
        setActiveOrg(null);
        setUserRole(null);
        setActiveOrgSlug(null);
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
      setActiveOrgSlug(selected.slug);

      const role = await getUserRoleInOrg(selected.id, user.id);
      setUserRole(role);
    } catch {
      setUserOrgs([]);
      setActiveOrg(null);
      setUserRole(null);
      setActiveOrgSlug(null);
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
    setActiveOrgSlug(org.slug);

    const role = await getUserRoleInOrg(orgId, user?.id);
    setUserRole(role);
  }, [userOrgs, user?.id]);

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

/** Version optionnelle : retourne undefined si hors OrgProvider (ex. Header frontend) */
export function useOrgOptional() {
  return useContext(OrgContext);
}
