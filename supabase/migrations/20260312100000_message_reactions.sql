-- =============================================================================
-- Migration : Réactions emoji sur les messages
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);

-- RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "message_reactions_select" ON public.message_reactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.user_belongs_to_org(m.org_id)));
CREATE POLICY "message_reactions_insert" ON public.message_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.user_belongs_to_org(m.org_id)));
CREATE POLICY "message_reactions_delete" ON public.message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Realtime pour les réactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
