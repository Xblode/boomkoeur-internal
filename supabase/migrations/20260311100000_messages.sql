-- =============================================================================
-- Migration : Messagerie interne (conversations + messages)
-- =============================================================================

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL DEFAULT 'Général',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON public.conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(type);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_pinned BOOLEAN DEFAULT false,
  related_entity_type TEXT,
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_org_id ON public.messages(org_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON public.messages(is_pinned) WHERE is_pinned = true;

-- RLS — conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_select_org" ON public.conversations FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "conversations_insert_org" ON public.conversations FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "conversations_update_org" ON public.conversations FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "conversations_delete_org" ON public.conversations FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- RLS — messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_org" ON public.messages FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "messages_insert_org" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "messages_update_org" ON public.messages FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "messages_delete_org" ON public.messages FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
