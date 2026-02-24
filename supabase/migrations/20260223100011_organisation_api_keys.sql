-- =============================================================================
-- Migration 011 : organisation_api_keys (clés API pour site externe)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organisation_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Clé par défaut',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key_hash)
);

CREATE INDEX IF NOT EXISTS idx_organisation_api_keys_org_id ON organisation_api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_organisation_api_keys_key_hash ON organisation_api_keys(key_hash);

ALTER TABLE public.organisation_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_api_keys_select_admin" ON public.organisation_api_keys
  FOR SELECT TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "org_api_keys_insert_admin" ON public.organisation_api_keys
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "org_api_keys_delete_admin" ON public.organisation_api_keys
  FOR DELETE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id));
