-- =============================================================================
-- Migration : google_calendar_id par organisation
-- =============================================================================
-- Stocke l'ID du calendrier Google à synchroniser (ex: 'primary' ou ID de calendrier partagé).
-- Null = sync désactivée.

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;

COMMENT ON COLUMN public.organisations.google_calendar_id IS 'ID du calendrier Google à synchroniser (primary ou ID partagé). Null = désactivé.';
