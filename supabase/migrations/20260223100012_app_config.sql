-- =============================================================================
-- Migration 012 : app_config (clé de chiffrement auto-générée)
-- =============================================================================
-- Stocke la clé de chiffrement des intégrations si non définie en env.
-- Accès restreint au service role uniquement (pas de RLS pour les requêtes serveur).

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS activé sans policy : seul le service_role (bypass RLS) peut accéder.
-- Les clients anon/authenticated n'ont aucune policy donc aucun accès.
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
