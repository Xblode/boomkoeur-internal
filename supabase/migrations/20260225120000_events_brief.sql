-- =============================================================================
-- Migration : Champ brief sur events (brief de campagne)
-- =============================================================================

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS brief TEXT DEFAULT '';
