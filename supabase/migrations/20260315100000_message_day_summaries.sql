-- =============================================================================
-- Migration : Journal - résumés quotidiens des messages (synthèse IA)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.message_day_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT message_day_summaries_org_date_key UNIQUE(org_id, date)
);

CREATE INDEX IF NOT EXISTS idx_message_day_summaries_org_date
  ON public.message_day_summaries(org_id, date DESC);

ALTER TABLE public.message_day_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_day_summaries_select_org"
  ON public.message_day_summaries FOR SELECT TO authenticated
  USING (public.user_belongs_to_org(org_id));

CREATE POLICY "message_day_summaries_insert_org"
  ON public.message_day_summaries FOR INSERT TO authenticated
  WITH CHECK (public.user_belongs_to_org(org_id));

CREATE POLICY "message_day_summaries_update_org"
  ON public.message_day_summaries FOR UPDATE TO authenticated
  USING (public.user_belongs_to_org(org_id))
  WITH CHECK (public.user_belongs_to_org(org_id));
