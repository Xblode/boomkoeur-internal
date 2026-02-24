-- =============================================================================
-- Migration 002 : Organisations multi-tenant
-- =============================================================================
-- Tables : organisations, organisation_members, organisation_invites
-- Fonctions : get_user_org_ids, is_org_admin, user_belongs_to_org
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'association' CHECK (type IN ('association', 'entreprise', 'collectif', 'autre')),
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organisations_slug ON organisations(slug);
CREATE INDEX IF NOT EXISTS idx_organisations_created_by ON organisations(created_by);

CREATE TABLE IF NOT EXISTS public.organisation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('fondateur', 'admin', 'membre', 'invite')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organisation_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organisation_members(user_id);

CREATE TABLE IF NOT EXISTS public.organisation_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_token ON organisation_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_org_id ON organisation_invites(org_id);

-- Fonctions helper
CREATE OR REPLACE FUNCTION public.get_user_org_ids(uid UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT om.org_id FROM public.organisation_members om WHERE om.user_id = uid;
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(uid UUID, oid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organisation_members om
    WHERE om.user_id = uid AND om.org_id = oid AND om.role IN ('fondateur', 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = uid AND p.is_super_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_org(oid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organisation_members om WHERE om.user_id = auth.uid() AND om.org_id = oid
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true
  );
$$;

-- RLS Organisations
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_select_member" ON public.organisations FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_org_ids(auth.uid())) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
CREATE POLICY "orgs_insert_authenticated" ON public.organisations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "orgs_update_admin" ON public.organisations FOR UPDATE TO authenticated USING (public.is_org_admin(auth.uid(), id)) WITH CHECK (public.is_org_admin(auth.uid(), id));
CREATE POLICY "orgs_delete_founder" ON public.organisations FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));

ALTER TABLE public.organisation_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_select" ON public.organisation_members FOR SELECT TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
CREATE POLICY "org_members_insert_admin" ON public.organisation_members FOR INSERT TO authenticated WITH CHECK (public.is_org_admin(auth.uid(), org_id) OR user_id = auth.uid());
CREATE POLICY "org_members_update_admin" ON public.organisation_members FOR UPDATE TO authenticated USING (public.is_org_admin(auth.uid(), org_id)) WITH CHECK (public.is_org_admin(auth.uid(), org_id));
CREATE POLICY "org_members_delete" ON public.organisation_members FOR DELETE TO authenticated USING (public.is_org_admin(auth.uid(), org_id) OR user_id = auth.uid());

ALTER TABLE public.organisation_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_invites_select_admin" ON public.organisation_invites FOR SELECT TO authenticated USING (public.is_org_admin(auth.uid(), org_id));
CREATE POLICY "org_invites_insert_admin" ON public.organisation_invites FOR INSERT TO authenticated WITH CHECK (public.is_org_admin(auth.uid(), org_id));
CREATE POLICY "org_invites_select_by_token" ON public.organisation_invites FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_invites_update_use" ON public.organisation_invites FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policies profiles (admin) : reference organisation_members
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
    OR EXISTS (SELECT 1 FROM public.organisation_members om WHERE om.user_id = auth.uid() AND om.role IN ('fondateur', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true)
    OR EXISTS (SELECT 1 FROM public.organisation_members om WHERE om.user_id = auth.uid() AND om.role IN ('fondateur', 'admin'))
  );
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
