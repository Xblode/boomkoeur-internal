-- =============================================================================
-- Migration : Ajout colonne is_favorite sur commercial_contacts
-- =============================================================================

ALTER TABLE public.commercial_contacts
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_commercial_contacts_is_favorite ON commercial_contacts(is_favorite);
