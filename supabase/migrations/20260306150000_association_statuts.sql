-- =============================================================================
-- Migration : Association Statuts module
-- =============================================================================
-- Adds: association_role on organisation_members, legal info on organisations,
--        meeting_type on meetings, association_statuts, association_statut_proposals,
--        association_statut_signatures tables + RLS + helper function
-- =============================================================================

-- 1. Association role on organisation_members
ALTER TABLE public.organisation_members
  ADD COLUMN IF NOT EXISTS association_role TEXT DEFAULT 'membre'
  CHECK (association_role IN (
    'president', 'secretaire', 'tresorier', 'vice_tresorier',
    'dir_strategique', 'dir_marketing', 'dir_artistique',
    'dir_logistique', 'dir_commerciale', 'dj', 'membre', 'benevole'
  ));

CREATE INDEX IF NOT EXISTS idx_org_members_association_role
  ON organisation_members(association_role);

-- 2. Legal info columns on organisations (read-only, sourced from statuts)
ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS legal_siege TEXT,
  ADD COLUMN IF NOT EXISTS legal_rna TEXT,
  ADD COLUMN IF NOT EXISTS legal_siret TEXT;

-- 3. Meeting type on meetings
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS meeting_type TEXT NOT NULL DEFAULT 'standard'
  CHECK (meeting_type IN ('standard', 'assemblee_generale'));

-- 4. Association statuts (versioned)
CREATE TABLE IF NOT EXISTS public.association_statuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  adopted_at TIMESTAMPTZ,
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_vote', 'pending_signatures', 'in_force', 'archived')),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_association_statuts_org ON association_statuts(org_id);
CREATE INDEX IF NOT EXISTS idx_association_statuts_status ON association_statuts(status);

-- 5. Proposals
CREATE TABLE IF NOT EXISTS public.association_statut_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'merged', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_association_proposals_org ON association_statut_proposals(org_id);
CREATE INDEX IF NOT EXISTS idx_association_proposals_status ON association_statut_proposals(status);

-- 6. Signatures
CREATE TABLE IF NOT EXISTS public.association_statut_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statut_version_id UUID NOT NULL REFERENCES association_statuts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  signed_at TIMESTAMPTZ,
  external_signature_id TEXT,
  external_provider TEXT CHECK (external_provider IN ('yousign', 'docusign')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(statut_version_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_association_signatures_version
  ON association_statut_signatures(statut_version_id);

-- 7. Helper: check if user is president in org
CREATE OR REPLACE FUNCTION public.is_org_president(uid UUID, oid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organisation_members om
    WHERE om.user_id = uid AND om.org_id = oid AND om.association_role = 'president'
  );
$$;

-- 8. RLS for association_statuts
ALTER TABLE public.association_statuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "association_statuts_select_org"
  ON public.association_statuts FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(org_id));

CREATE POLICY "association_statuts_insert_admin"
  ON public.association_statuts FOR INSERT TO authenticated
  WITH CHECK (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );

CREATE POLICY "association_statuts_update_admin"
  ON public.association_statuts FOR UPDATE TO authenticated
  USING (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  )
  WITH CHECK (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );

CREATE POLICY "association_statuts_delete_admin"
  ON public.association_statuts FOR DELETE TO authenticated
  USING (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );

-- 9. RLS for association_statut_proposals
ALTER TABLE public.association_statut_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "association_proposals_select_org"
  ON public.association_statut_proposals FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(org_id));

CREATE POLICY "association_proposals_insert_member"
  ON public.association_statut_proposals FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(org_id) AND proposed_by = auth.uid());

CREATE POLICY "association_proposals_update_admin"
  ON public.association_statut_proposals FOR UPDATE TO authenticated
  USING (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
    OR proposed_by = auth.uid()
  )
  WITH CHECK (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
    OR proposed_by = auth.uid()
  );

CREATE POLICY "association_proposals_delete_admin"
  ON public.association_statut_proposals FOR DELETE TO authenticated
  USING (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );

-- 10. RLS for association_statut_signatures
ALTER TABLE public.association_statut_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "association_signatures_select"
  ON public.association_statut_signatures FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.association_statuts s
      WHERE s.id = statut_version_id AND public.user_belongs_to_org(s.org_id)
    )
  );

CREATE POLICY "association_signatures_insert_self"
  ON public.association_statut_signatures FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "association_signatures_update_self"
  ON public.association_statut_signatures FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
