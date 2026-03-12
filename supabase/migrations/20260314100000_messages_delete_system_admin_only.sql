-- =============================================================================
-- Migration : Seuls admin/fondateur peuvent supprimer les messages système
-- =============================================================================

DROP POLICY IF EXISTS "messages_delete_org" ON public.messages;

CREATE POLICY "messages_delete_org" ON public.messages
  FOR DELETE TO authenticated
  USING (
    public.user_belongs_to_org(org_id)
    AND (
      type != 'system'
      OR public.is_org_admin(auth.uid(), org_id)
    )
  );
