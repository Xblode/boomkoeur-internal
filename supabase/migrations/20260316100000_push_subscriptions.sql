-- =============================================================================
-- Migration : Abonnements push pour notifications web (messages)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_org_id ON public.push_subscriptions(org_id);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_select_own" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "push_subscriptions_insert_own" ON public.push_subscriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.user_belongs_to_org(org_id));

CREATE POLICY "push_subscriptions_delete_own" ON public.push_subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());
