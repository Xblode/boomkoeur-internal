-- =============================================================================
-- Migration 010 : organisation_integrations (credentials chiffrés par org)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organisation_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('shotgun', 'meta')),
  encrypted_credentials TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_organisation_integrations_org_id ON organisation_integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_organisation_integrations_provider ON organisation_integrations(provider);

ALTER TABLE public.organisation_integrations ENABLE ROW LEVEL SECURITY;

-- SELECT: tout membre de l'org peut lire (pour utiliser l'intégration via l'API)
-- INSERT/UPDATE/DELETE: seuls les admins peuvent configurer
CREATE POLICY "org_integrations_select_member" ON public.organisation_integrations
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(org_id));

CREATE POLICY "org_integrations_insert_admin" ON public.organisation_integrations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "org_integrations_update_admin" ON public.organisation_integrations
  FOR UPDATE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id))
  WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "org_integrations_delete_admin" ON public.organisation_integrations
  FOR DELETE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id));
