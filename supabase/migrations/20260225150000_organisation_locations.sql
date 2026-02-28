-- =============================================================================
-- Migration : organisation_locations (lieux par org)
-- =============================================================================
-- Lieux enregistrés avec adresse, nom optionnel et ville.
-- Utilisé par LocationPicker et la modal de gestion des lieux.

CREATE TABLE IF NOT EXISTS public.organisation_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  name TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, address)
);

CREATE INDEX IF NOT EXISTS idx_organisation_locations_org_id ON organisation_locations(org_id);

CREATE OR REPLACE FUNCTION public.update_organisation_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organisation_locations_updated_at ON public.organisation_locations;
CREATE TRIGGER organisation_locations_updated_at
  BEFORE UPDATE ON public.organisation_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_organisation_locations_updated_at();

ALTER TABLE public.organisation_locations ENABLE ROW LEVEL SECURITY;

-- SELECT: tout membre de l'org peut lire
CREATE POLICY "org_locations_select_member" ON public.organisation_locations
  FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(org_id));

-- INSERT/UPDATE/DELETE: seuls les admins peuvent gérer
CREATE POLICY "org_locations_insert_admin" ON public.organisation_locations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "org_locations_update_admin" ON public.organisation_locations
  FOR UPDATE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id))
  WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "org_locations_delete_admin" ON public.organisation_locations
  FOR DELETE TO authenticated
  USING (public.is_org_admin(auth.uid(), org_id));
