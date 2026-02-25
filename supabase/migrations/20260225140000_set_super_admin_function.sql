-- =============================================================================
-- Fonction utilitaire : passer un compte en super-admin
-- =============================================================================
-- Usage dans Supabase SQL Editor :
--   SELECT set_super_admin_by_email('votre-email@example.com');
-- ou par user ID :
--   SELECT set_super_admin_by_id('uuid-de-votre-user');
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_super_admin_by_email(user_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET is_super_admin = true, updated_at = now()
  WHERE email = user_email;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_super_admin_by_id(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET is_super_admin = true, updated_at = now()
  WHERE id = user_uuid;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
