-- =============================================================================
-- Sync last_sign_in_at (auth.users) vers profiles.last_login_at
-- =============================================================================
-- À chaque connexion, Supabase Auth met à jour auth.users.last_sign_in_at.
-- Ce trigger copie cette valeur dans profiles.last_login_at pour l'affichage.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_last_login_to_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_login_at = NEW.last_sign_in_at,
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_last_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_last_sign_in
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE PROCEDURE public.sync_last_login_to_profiles();

-- Backfill : copier last_sign_in_at existant vers profiles
UPDATE public.profiles p
SET last_login_at = u.last_sign_in_at,
    updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND u.last_sign_in_at IS NOT NULL
  AND (p.last_login_at IS NULL OR p.last_login_at < u.last_sign_in_at);
