-- =============================================================================
-- Migration : Champs légaux supplémentaires sur organisations
-- =============================================================================

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS legal_activite_principale TEXT,
  ADD COLUMN IF NOT EXISTS legal_categorie_juridique TEXT,
  ADD COLUMN IF NOT EXISTS legal_slogan TEXT,
  ADD COLUMN IF NOT EXISTS legal_tranche_effectif TEXT,
  ADD COLUMN IF NOT EXISTS legal_tranche_effectif_annee INTEGER,
  ADD COLUMN IF NOT EXISTS legal_categorie_entreprise TEXT,
  ADD COLUMN IF NOT EXISTS legal_categorie_entreprise_annee INTEGER;
