-- =============================================================================
-- Migration : ajouter 'meta_config' au provider organisation_integrations
-- Stocke les identifiants OAuth Instagram (App ID, Secret) par org, comme pour Google
-- =============================================================================

ALTER TABLE public.organisation_integrations
  DROP CONSTRAINT IF EXISTS organisation_integrations_provider_check;

ALTER TABLE public.organisation_integrations
  ADD CONSTRAINT organisation_integrations_provider_check
  CHECK (provider IN ('shotgun', 'meta', 'google', 'meta_config'));
