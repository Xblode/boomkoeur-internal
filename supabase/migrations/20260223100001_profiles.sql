-- =============================================================================
-- Migration 001 : Profiles (extension auth.users)
-- =============================================================================
-- Table profiles : first_name, last_name, email, status, is_super_admin
-- Roles par organisation (organisation_members), pas de role global
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  phone TEXT,
  position TEXT,
  avatar TEXT,
  registered_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Trigger : creer un profil a chaque nouvel utilisateur auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data ->> 'nom', ''),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data ->> 'status', 'active')
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Backfill : profils pour utilisateurs auth existants
INSERT INTO public.profiles (id, first_name, last_name, email, status)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'prenom', ''),
  COALESCE(u.raw_user_meta_data ->> 'last_name', u.raw_user_meta_data ->> 'nom', ''),
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data ->> 'status', 'active')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
