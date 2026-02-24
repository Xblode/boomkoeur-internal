-- =============================================================================
-- Migration : ajouter 'google' au provider organisation_integrations
-- =============================================================================

ALTER TABLE public.organisation_integrations
  DROP CONSTRAINT IF EXISTS organisation_integrations_provider_check;

ALTER TABLE public.organisation_integrations
  ADD CONSTRAINT organisation_integrations_provider_check
  CHECK (provider IN ('shotgun', 'meta', 'google'));
