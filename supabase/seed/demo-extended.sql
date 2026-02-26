-- =============================================================================
-- Seed DÉMO EXTENDED : Contenu supplémentaire
-- =============================================================================
-- À exécuter APRÈS supabase/seed/demo.sql
-- Ajoute : transactions, artistes, posts campagne, budgets par événement
-- =============================================================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_org_id UUID;
  bank_id UUID;
  ev1_id UUID;
  ev2_id UUID;
  ev3_id UUID;
  art_dj UUID;
  art_photo UUID;
  art_lj UUID;
  fy INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
BEGIN
  SELECT id INTO demo_org_id FROM public.organisations WHERE slug = 'demo' LIMIT 1;
  IF demo_org_id IS NULL THEN
    RAISE EXCEPTION 'Organisation démo introuvable. Exécutez d''abord supabase/seed/demo.sql';
  END IF;

  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@perret.app' LIMIT 1;
  SELECT id INTO bank_id FROM finance_bank_accounts WHERE org_id = demo_org_id LIMIT 1;

  SELECT id INTO ev1_id FROM events WHERE org_id = demo_org_id AND name = 'Soirée Électro Printemps' LIMIT 1;
  SELECT id INTO ev2_id FROM events WHERE org_id = demo_org_id AND name = 'Festival Été 2026' LIMIT 1;
  SELECT id INTO ev3_id FROM events WHERE org_id = demo_org_id AND name = 'Afterwork Networking' LIMIT 1;

  -- ========== 1. Artistes supplémentaires ==========
  INSERT INTO public.artists (id, name, genre, type, org_id)
  SELECT gen_random_uuid(), 'Max Beat', 'Techno / Minimal', 'dj', demo_org_id
  WHERE NOT EXISTS (SELECT 1 FROM artists WHERE org_id = demo_org_id AND name = 'Max Beat');
  INSERT INTO public.artists (id, name, genre, type, org_id)
  SELECT gen_random_uuid(), 'Pixel Vision', 'Photographe événementiel', 'photographe', demo_org_id
  WHERE NOT EXISTS (SELECT 1 FROM artists WHERE org_id = demo_org_id AND name = 'Pixel Vision');
  INSERT INTO public.artists (id, name, genre, type, org_id)
  SELECT gen_random_uuid(), 'Neon Lights', 'Scénographie / LJ', 'lightjockey', demo_org_id
  WHERE NOT EXISTS (SELECT 1 FROM artists WHERE org_id = demo_org_id AND name = 'Neon Lights');

  SELECT id INTO art_dj FROM artists WHERE org_id = demo_org_id AND name = 'Max Beat' LIMIT 1;
  SELECT id INTO art_photo FROM artists WHERE org_id = demo_org_id AND name = 'Pixel Vision' LIMIT 1;
  SELECT id INTO art_lj FROM artists WHERE org_id = demo_org_id AND name = 'Neon Lights' LIMIT 1;

  -- Lier artistes aux événements
  IF ev1_id IS NOT NULL AND art_dj IS NOT NULL THEN
    INSERT INTO event_artists (event_id, artist_id, performance_time, fee)
    VALUES (ev1_id, art_dj, '23:30', 500)
    ON CONFLICT (event_id, artist_id) DO NOTHING;
  END IF;
  IF ev2_id IS NOT NULL THEN
    INSERT INTO event_artists (event_id, artist_id, performance_time, fee)
    SELECT ev2_id, id, NULL, 1200 FROM artists WHERE org_id = demo_org_id AND name IN ('DJ Nova', 'Luna Sound', 'Max Beat')
    ON CONFLICT (event_id, artist_id) DO NOTHING;
    IF art_photo IS NOT NULL THEN
      INSERT INTO event_artists (event_id, artist_id, performance_time, fee)
      VALUES (ev2_id, art_photo, NULL, 800)
      ON CONFLICT (event_id, artist_id) DO NOTHING;
    END IF;
    IF art_lj IS NOT NULL THEN
      INSERT INTO event_artists (event_id, artist_id, performance_time, fee)
      VALUES (ev2_id, art_lj, NULL, 600)
      ON CONFLICT (event_id, artist_id) DO NOTHING;
    END IF;
  END IF;
  IF ev3_id IS NOT NULL AND art_dj IS NOT NULL THEN
    INSERT INTO event_artists (event_id, artist_id, performance_time, fee)
    VALUES (ev3_id, art_dj, '19:00', 300)
    ON CONFLICT (event_id, artist_id) DO NOTHING;
  END IF;

  -- ========== 2. Transactions supplémentaires ==========
  IF bank_id IS NOT NULL THEN
    INSERT INTO finance_transactions (fiscal_year, date, label, amount, type, category, bank_account_id, status, org_id, created_by)
    VALUES
      (fy, CURRENT_DATE - INTERVAL '20 days', 'Ventes prévente Soirée Électro', 1850, 'income', 'Billetterie', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '15 days', 'Location matériel son', 320, 'expense', 'Communication', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '12 days', 'Impression affiches', 180, 'expense', 'Communication', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '8 days', 'Cachet Luna Sound (acompte)', 300, 'expense', 'Artistes', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '6 days', 'Pub Facebook ciblée', 150, 'expense', 'Communication', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '4 days', 'Ventes merchandising (suite)', 420, 'income', 'Merchandising', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '2 days', 'Billetterie Afterwork', 650, 'income', 'Billetterie', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE - INTERVAL '1 day', 'Réservation salle Festival', 2000, 'expense', 'Communication', bank_id, 'validated', demo_org_id, demo_user_id),
      (fy, CURRENT_DATE, 'Acompte scénographie Festival', 1500, 'expense', 'Communication', bank_id, 'pending', demo_org_id, demo_user_id);
  END IF;

  -- ========== 3. Posts campagne (com_workflow) sur les événements ==========
  IF ev1_id IS NOT NULL THEN
    UPDATE events SET com_workflow = jsonb_build_object(
      'activePhase', 'communication',
      'activeStep', 2,
      'manual', '{"textesReady": true, "shotgunDone": true}'::jsonb,
      'shotgunUrl', 'https://demo.perret.app/soiree-electro',
      'posts', jsonb_build_array(
        jsonb_build_object(
          'id', 'post-ev1-1',
          'name', 'Annonce line-up',
          'description', 'Post Instagram annonçant DJ Nova et Luna Sound',
          'networks', '["instagram"]'::jsonb,
          'type', 'post',
          'scheduledDate', to_char(CURRENT_DATE + INTERVAL '10 days', 'YYYY-MM-DD') || 'T10:00:00.000Z',
          'bio', '🔥 Soirée Électro Printemps - 21h au Transbordeur ! DJ Nova & Luna Sound vous attendent.',
          'visuals', ('[{"id":"v1","url":"https://images.unsplash.com/photo-1571266028243-d220e8d2d5a8?w=800","mediaType":"image","createdAt":"' || to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') || '"}]')::jsonb,
          'verified', true,
          'published', false,
          'createdAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        ),
        jsonb_build_object(
          'id', 'post-ev1-2',
          'name', 'Teaser vidéo',
          'description', 'Reel teaser 15 sec',
          'networks', '["instagram"]'::jsonb,
          'type', 'reel',
          'scheduledDate', to_char(CURRENT_DATE + INTERVAL '12 days', 'YYYY-MM-DD') || 'T18:00:00.000Z',
          'verified', true,
          'published', false,
          'createdAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        ),
        jsonb_build_object(
          'id', 'post-ev1-3',
          'name', 'Rappel J-1',
          'description', 'Story rappel la veille',
          'networks', '["instagram","facebook"]'::jsonb,
          'type', 'story',
          'scheduledDate', to_char(CURRENT_DATE + INTERVAL '13 days', 'YYYY-MM-DD') || 'T10:00:00.000Z',
          'verified', false,
          'published', false,
          'createdAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        )
      ),
      'overrides', '{"planComDone": true, "postsReady": true}'::jsonb
    )
    WHERE id = ev1_id;
  END IF;

  IF ev2_id IS NOT NULL THEN
    UPDATE events SET com_workflow = jsonb_build_object(
      'activePhase', 'preparation',
      'activeStep', 1,
      'manual', '{}'::jsonb,
      'posts', jsonb_build_array(
        jsonb_build_object(
          'id', 'post-ev2-1',
          'name', 'Save the date',
          'description', 'Premier post annonce Festival Été',
          'networks', '["instagram","facebook"]'::jsonb,
          'type', 'post',
          'scheduledDate', to_char(CURRENT_DATE + INTERVAL '60 days', 'YYYY-MM-DD') || 'T09:00:00.000Z',
          'bio', '📅 Festival Été 2026 - Parc de la Tête d''Or - 3 scènes, 20 artistes. Réservez la date !',
          'verified', false,
          'published', false,
          'createdAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        ),
        jsonb_build_object(
          'id', 'post-ev2-2',
          'name', 'Line-up partiel',
          'description', 'Révélation des premiers noms',
          'networks', '["instagram"]'::jsonb,
          'type', 'carousel',
          'scheduledDate', to_char(CURRENT_DATE + INTERVAL '70 days', 'YYYY-MM-DD') || 'T10:00:00.000Z',
          'verified', false,
          'published', false,
          'createdAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        )
      ),
      'overrides', '{"planComDone": true}'::jsonb
    )
    WHERE id = ev2_id;
  END IF;

  IF ev3_id IS NOT NULL THEN
    UPDATE events SET com_workflow = jsonb_build_object(
      'activePhase', 'communication',
      'activeStep', 1,
      'manual', '{}'::jsonb,
      'posts', jsonb_build_array(
        jsonb_build_object(
          'id', 'post-ev3-1',
          'name', 'Invitation networking',
          'description', 'Post LinkedIn/Instagram ciblé pros',
          'networks', '["instagram"]'::jsonb,
          'type', 'post',
          'scheduledDate', to_char(CURRENT_DATE + INTERVAL '5 days', 'YYYY-MM-DD') || 'T08:00:00.000Z',
          'bio', '🤝 Afterwork Networking - Le Sucre, 18h. Rencontrez les acteurs de l''événementiel lyonnais.',
          'verified', true,
          'published', false,
          'createdAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        )
      ),
      'overrides', '{}'::jsonb
    )
    WHERE id = ev3_id;
  END IF;

  -- ========== 4. Budgets par événement (finance_event_budgets) ==========
  -- Supprimer les budgets existants pour réinitialiser (idempotence)
  DELETE FROM finance_event_budgets WHERE org_id = demo_org_id;

  IF ev1_id IS NOT NULL THEN
    INSERT INTO finance_event_budgets (event_id, category, type, allocated_amount, actual_amount, sort_order, org_id)
    VALUES
      (ev1_id, 'Billetterie', 'income', 8000, 4200, 0, demo_org_id),
      (ev1_id, 'Bar', 'income', 2000, NULL, 1, demo_org_id),
      (ev1_id, 'Merchandising', 'income', 800, 850, 2, demo_org_id),
      (ev1_id, 'Artistes', 'expense', 2000, 700, 3, demo_org_id),
      (ev1_id, 'Location salle', 'expense', 1500, 1500, 4, demo_org_id),
      (ev1_id, 'Communication', 'expense', 500, 650, 5, demo_org_id),
      (ev1_id, 'Sécurité', 'expense', 800, NULL, 6, demo_org_id);
  END IF;

  IF ev2_id IS NOT NULL THEN
    INSERT INTO finance_event_budgets (event_id, category, type, allocated_amount, allocated_amount_low, allocated_amount_high, actual_amount, sort_order, org_id)
    VALUES
      (ev2_id, 'Billetterie', 'income', 45000, 40000, 50000, NULL, 0, demo_org_id),
      (ev2_id, 'Partenariats', 'income', 15000, 10000, 20000, NULL, 1, demo_org_id),
      (ev2_id, 'Bar / Restauration', 'income', 8000, 6000, 10000, NULL, 2, demo_org_id),
      (ev2_id, 'Artistes', 'expense', 25000, 20000, 30000, 5000, 3, demo_org_id),
      (ev2_id, 'Location site', 'expense', 8000, 7000, 9000, 2000, 4, demo_org_id),
      (ev2_id, 'Scénographie', 'expense', 12000, 10000, 15000, 1500, 5, demo_org_id),
      (ev2_id, 'Communication', 'expense', 5000, 4000, 6000, NULL, 6, demo_org_id),
      (ev2_id, 'Sécurité / Secours', 'expense', 6000, 5000, 7000, NULL, 7, demo_org_id);
  END IF;

  IF ev3_id IS NOT NULL THEN
    INSERT INTO finance_event_budgets (event_id, category, type, allocated_amount, actual_amount, sort_order, org_id)
    VALUES
      (ev3_id, 'Participation', 'income', 1500, 650, 0, demo_org_id),
      (ev3_id, 'Partenaires', 'income', 500, NULL, 1, demo_org_id),
      (ev3_id, 'Location espace', 'expense', 400, 400, 2, demo_org_id),
      (ev3_id, 'Artistes', 'expense', 500, 300, 3, demo_org_id),
      (ev3_id, 'Communication', 'expense', 200, NULL, 4, demo_org_id);
  END IF;

  RAISE NOTICE 'Seed démo extended terminé.';
END $$;
