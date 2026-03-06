-- =============================================================================
-- Migration : Documents officiels de l'État (JOAFE, Liste dirigeants, Récépissé CR)
-- Stockés par organisation, sélectionnés via Google Drive Picker.
-- =============================================================================

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS doc_joafe_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_joafe_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_liste_dirigeants_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_liste_dirigeants_name TEXT,
  ADD COLUMN IF NOT EXISTS doc_recepisse_cr_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_recepisse_cr_name TEXT;
