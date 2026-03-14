-- =============================================================================
-- Migration : Permettre aux membres de l'org de voir les statuts de lecture
-- des autres membres (pour afficher "vu par" sur les messages)
-- =============================================================================

-- Les membres d'une org peuvent voir les conversation_reads des conversations
-- de cette org (pour afficher les avatars "vu par" sous chaque message)
CREATE POLICY "conversation_reads_select_org_conversation"
  ON public.conversation_reads FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  );

-- Realtime pour mettre à jour les avatars "vu par" quand quelqu'un marque comme lu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_reads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_reads;
  END IF;
END $$;
