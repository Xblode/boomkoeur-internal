-- =============================================================================
-- Migration : Bucket Storage pour pièces jointes des messages
-- =============================================================================
-- Si vous avez l'erreur "Bucket not found", exécutez cette migration :
--   supabase db push
-- Ou exécutez ce SQL manuellement dans le SQL Editor du dashboard Supabase.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('messages-attachments', 'messages-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS : les utilisateurs authentifiés peuvent uploader et lire
DROP POLICY IF EXISTS "messages_attachments_insert" ON storage.objects;
CREATE POLICY "messages_attachments_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'messages-attachments');

DROP POLICY IF EXISTS "messages_attachments_select" ON storage.objects;
CREATE POLICY "messages_attachments_select" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'messages-attachments');
