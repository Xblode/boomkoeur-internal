-- =============================================================================
-- Migration : Bucket Storage pour avatars utilisateurs
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Chaque utilisateur peut uploader uniquement dans son propre dossier (avatars/{user_id}/*)
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Chaque utilisateur peut mettre à jour son propre avatar
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Chaque utilisateur peut supprimer son propre avatar
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Tout utilisateur authentifié peut lire les avatars (bucket public)
DROP POLICY IF EXISTS "avatars_select_authenticated" ON storage.objects;
CREATE POLICY "avatars_select_authenticated" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
