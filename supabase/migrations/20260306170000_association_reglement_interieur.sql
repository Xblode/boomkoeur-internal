-- =============================================================================
-- Migration : Règlement intérieur de l'association
-- =============================================================================
-- Table unique par org. Modifiable uniquement dans l'espace Présidence.
-- Pas d'AG ni signatures : validation directe.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.association_reglement_interieur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE UNIQUE,
  content JSONB NOT NULL DEFAULT '{"sections":[]}',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reglement_interieur_org ON association_reglement_interieur(org_id);

-- RLS
ALTER TABLE public.association_reglement_interieur ENABLE ROW LEVEL SECURITY;

-- Lecture : tous les membres de l'org
CREATE POLICY "reglement_interieur_select_org"
  ON public.association_reglement_interieur FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(org_id));

-- Écriture : admin ou président uniquement
CREATE POLICY "reglement_interieur_insert_admin"
  ON public.association_reglement_interieur FOR INSERT TO authenticated
  WITH CHECK (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );

CREATE POLICY "reglement_interieur_update_admin"
  ON public.association_reglement_interieur FOR UPDATE TO authenticated
  USING (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  )
  WITH CHECK (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );

CREATE POLICY "reglement_interieur_delete_admin"
  ON public.association_reglement_interieur FOR DELETE TO authenticated
  USING (
    public.is_org_admin(auth.uid(), org_id)
    OR public.is_org_president(auth.uid(), org_id)
  );
