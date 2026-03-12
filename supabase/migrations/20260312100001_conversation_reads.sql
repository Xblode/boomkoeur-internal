-- =============================================================================
-- Migration : Suivi de lecture pour le compteur de non lus
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversation_reads (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_reads_conversation_id ON public.conversation_reads(conversation_id);

-- RLS
ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversation_reads_select_own" ON public.conversation_reads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "conversation_reads_insert_own" ON public.conversation_reads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "conversation_reads_update_own" ON public.conversation_reads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
