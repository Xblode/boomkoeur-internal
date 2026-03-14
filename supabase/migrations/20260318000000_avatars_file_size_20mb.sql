-- =============================================================================
-- Migration : Augmenter la limite de taille des avatars à 20 Mo
-- =============================================================================

UPDATE storage.buckets
SET file_size_limit = 20971520  -- 20 Mo
WHERE id = 'avatars';
