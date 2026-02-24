-- =============================================================================
-- Migration 009 : Fonction create_organisation (bypass RLS pour creation initiale)
-- =============================================================================
-- Resout le probleme RLS quand auth.uid() n'est pas correctement transmis
-- (session/cookies). La fonction utilise auth.uid() cote DB et insere en
-- SECURITY DEFINER, garantissant que created_by = utilisateur authentifie.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_organisation(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'association',
  p_slug TEXT DEFAULT NULL
)
RETURNS public.organisations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_slug TEXT;
  v_base_slug TEXT;
  v_attempt INT := 0;
  v_org public.organisations;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Non authentifie';
  END IF;

  -- Slug unique (aligne avec slugify JS)
  v_base_slug := lower(regexp_replace(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g'));
  v_base_slug := trim(both '-' from v_base_slug);
  IF v_base_slug = '' THEN
    v_base_slug := 'org';
  END IF;

  v_slug := COALESCE(p_slug, v_base_slug);
  WHILE EXISTS (SELECT 1 FROM public.organisations WHERE slug = v_slug) LOOP
    v_attempt := v_attempt + 1;
    v_slug := v_base_slug || '-' || v_attempt;
  END LOOP;

  -- Insert organisation
  INSERT INTO public.organisations (name, description, type, slug, created_by)
  VALUES (trim(p_name), nullif(trim(p_description), ''), p_type, v_slug, v_uid)
  RETURNING * INTO v_org;

  -- Insert membre fondateur
  INSERT INTO public.organisation_members (org_id, user_id, role)
  VALUES (v_org.id, v_uid, 'fondateur');

  RETURN v_org;
END;
$$;

-- Grant execute aux utilisateurs authentifies
GRANT EXECUTE ON FUNCTION public.create_organisation(TEXT, TEXT, TEXT, TEXT) TO authenticated;
