-- =============================================================================
-- Seed DÉMO : Organisation et contenu prérempli
-- =============================================================================
-- PRÉREQUIS : Créer l'utilisateur demo@perret.app via Supabase Dashboard
-- (Authentication > Users > Add user) avec un mot de passe connu.
-- Puis définir DEMO_PASSWORD dans .env.local pour l'API /api/demo/enter
-- =============================================================================

DO $$
DECLARE
  demo_user_id UUID;
  demo_org_id UUID;
  ev1_id UUID;
  bank_id UUID;
  inv1_id UUID;
  fy INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
BEGIN
  -- Récupérer l'ID du compte démo (doit exister)
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@perret.app' LIMIT 1;
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur demo@perret.app introuvable. Créez-le via Supabase Dashboard > Authentication > Users.';
  END IF;

  -- Supprimer les données démo existantes (idempotence)
  -- Ordre inverse des dépendances (org_id)
  DELETE FROM finance_event_budgets WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_invoice_lines WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_invoices WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_transactions WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_transaction_categories WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_bank_accounts WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_budget_categories WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM finance_budgets WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM product_providers WHERE product_id IN (SELECT id FROM products WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo'));
  DELETE FROM product_stock_movements WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM product_variants WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM product_comments WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM products WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM contact_notes WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM commercial_contacts WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM event_comments WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM event_artists WHERE event_id IN (SELECT id FROM events WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo'));
  DELETE FROM events WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM artists WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM meetings WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM organisation_members WHERE org_id IN (SELECT id FROM organisations WHERE slug = 'demo');
  DELETE FROM public.organisations WHERE slug = 'demo';

  -- 1. Organisation démo
  INSERT INTO public.organisations (id, name, description, type, slug, created_by)
  VALUES (
    gen_random_uuid(),
    'Perret Démo',
    'Organisation de démonstration avec des données préremplies pour explorer Perret.',
    'association',
    'demo',
    demo_user_id
  )
  RETURNING id INTO demo_org_id;

  -- Lier l'utilisateur comme fondateur
  INSERT INTO public.organisation_members (org_id, user_id, role)
  VALUES (demo_org_id, demo_user_id, 'fondateur');

  -- 2. Artistes
  INSERT INTO public.artists (id, name, genre, type, org_id)
  VALUES
    (gen_random_uuid(), 'DJ Nova', 'House / Techno', 'dj', demo_org_id),
    (gen_random_uuid(), 'Luna Sound', 'Ambient / Downtempo', 'dj', demo_org_id);

  -- 3. Événements (premier séparé pour récupérer ev1_id)
  INSERT INTO public.events (id, name, date, end_time, location, description, status, org_id, created_by, media)
  VALUES (
    gen_random_uuid(),
    'Soirée Électro Printemps',
    (CURRENT_DATE + INTERVAL '14 days')::TIMESTAMPTZ + TIME '21:00',
    '03:00',
    'Le Transbordeur, Lyon',
    'Grande soirée électro avec DJ Nova et Luna Sound. Billetterie ouverte.',
    'confirmed',
    demo_org_id,
    demo_user_id,
    '{"posterShotgun": "https://images.unsplash.com/photo-1571266028243-d220e8d2d5a8?w=400", "posterInsta": "https://images.unsplash.com/photo-1571266028243-d220e8d2d5a8?w=400"}'::JSONB
  )
  RETURNING id INTO ev1_id;

  INSERT INTO public.events (id, name, date, end_time, location, description, status, org_id, created_by, media)
  VALUES
    (
      gen_random_uuid(),
      'Festival Été 2026',
      (CURRENT_DATE + INTERVAL '90 days')::TIMESTAMPTZ + TIME '14:00',
      '23:59',
      'Parc de la Tête d''Or, Lyon',
      'Festival en plein air, 3 scènes, 20 artistes.',
      'preparation',
      demo_org_id,
      demo_user_id,
      '{}'::JSONB
    ),
    (
      gen_random_uuid(),
      'Afterwork Networking',
      (CURRENT_DATE + INTERVAL '7 days')::TIMESTAMPTZ + TIME '18:00',
      '21:00',
      'Le Sucre, Lyon',
      'Soirée networking pour les acteurs de l''événementiel.',
      'confirmed',
      demo_org_id,
      demo_user_id,
      '{}'::JSONB
    );

  -- Lier artistes au premier événement
  INSERT INTO public.event_artists (event_id, artist_id, performance_time, fee)
  SELECT ev1_id, id, '22:00', 800 FROM public.artists WHERE org_id = demo_org_id AND name = 'DJ Nova'
  ON CONFLICT DO NOTHING;
  INSERT INTO public.event_artists (event_id, artist_id, performance_time, fee)
  SELECT ev1_id, id, '00:00', 600 FROM public.artists WHERE org_id = demo_org_id AND name = 'Luna Sound'
  ON CONFLICT DO NOTHING;

  -- 4. Réunions
  INSERT INTO public.meetings (id, title, description, date, start_time, end_time, location, status, org_id, created_by, minutes)
  VALUES
    (
      gen_random_uuid(),
      'Point hebdo équipe',
      'Bilan de la semaine, préparation Soirée Électro.',
      (CURRENT_DATE - INTERVAL '2 days')::TIMESTAMPTZ + TIME '10:00',
      '10:00',
      '11:00',
      'Bureau',
      'completed',
      demo_org_id,
      demo_user_id,
      '{"freeText": "Réunion productive. Points validés : billetterie ouverte, communication Instagram prête. Prochaine réunion mercredi pour valider les visuels."}'::JSONB
    ),
    (
      gen_random_uuid(),
      'Préparation Festival Été',
      'Budget, programmation, partenaires.',
      (CURRENT_DATE + INTERVAL '5 days')::TIMESTAMPTZ + TIME '14:00',
      '14:00',
      '16:00',
      'Salle de réunion',
      'upcoming',
      demo_org_id,
      demo_user_id,
      '{"freeText": ""}'::JSONB
    );

  -- 5. Contacts commerciaux
  INSERT INTO public.commercial_contacts (id, type, status, name, company, email, phone, org_id, created_by)
  VALUES
    (gen_random_uuid(), 'supplier', 'active', 'Print & Co', 'Print & Co SAS', 'contact@printco.fr', '04 78 00 00 01', demo_org_id, demo_user_id),
    (gen_random_uuid(), 'partner', 'active', 'Radio Lyon', 'Radio Lyon', 'partenariats@radiolyon.fr', '04 78 00 00 02', demo_org_id, demo_user_id);

  -- 6. Produits
  INSERT INTO public.products (id, sku, name, description, type, status, category, prices, total_stock, stock_threshold, org_id, created_by, event_id)
  VALUES
    (gen_random_uuid(), 'DEMO-TEE-001', 'T-shirt Perret', 'T-shirt coton événement', 'tshirt', 'available', 'Merch', '{"public": 25, "member": 20, "partner": 22}'::JSONB, 150, 20, demo_org_id, demo_user_id, ev1_id),
    (gen_random_uuid(), 'DEMO-POST-001', 'Affiche Soirée Électro', 'Affiche A3 signée', 'poster', 'available', 'Merch', '{"public": 15, "member": 12, "partner": 13}'::JSONB, 45, 10, demo_org_id, demo_user_id, ev1_id);

  -- 7. Finance : compte bancaire
  INSERT INTO finance_bank_accounts (id, name, bank_name, account_type, initial_balance, current_balance, org_id, created_by)
  VALUES (gen_random_uuid(), 'Compte principal', 'Banque Démo', 'checking', 15000, 18500, demo_org_id, demo_user_id)
  RETURNING id INTO bank_id;

  -- Catégories de transactions
  INSERT INTO finance_transaction_categories (id, name, type, is_default, org_id, created_by)
  VALUES
    (gen_random_uuid(), 'Billetterie', 'income', true, demo_org_id, demo_user_id),
    (gen_random_uuid(), 'Merchandising', 'income', false, demo_org_id, demo_user_id),
    (gen_random_uuid(), 'Artistes', 'expense', true, demo_org_id, demo_user_id),
    (gen_random_uuid(), 'Communication', 'expense', false, demo_org_id, demo_user_id);

  -- Transactions
  INSERT INTO finance_transactions (fiscal_year, date, label, amount, type, category, bank_account_id, status, org_id, created_by)
  VALUES
    (fy, CURRENT_DATE - INTERVAL '10 days', 'Ventes billetterie Soirée Électro', 4200, 'income', 'Billetterie', bank_id, 'validated', demo_org_id, demo_user_id),
    (fy, CURRENT_DATE - INTERVAL '5 days', 'Cachet DJ Nova (acompte)', 400, 'expense', 'Artistes', bank_id, 'validated', demo_org_id, demo_user_id),
    (fy, CURRENT_DATE - INTERVAL '3 days', 'Ventes merchandising', 850, 'income', 'Merchandising', bank_id, 'validated', demo_org_id, demo_user_id);

  -- Facture
  INSERT INTO finance_invoices (id, invoice_number, type, issue_date, due_date, status, client_type, client_name, subtotal_excl_tax, total_vat, total_incl_tax, org_id, created_by)
  VALUES (gen_random_uuid(), 'FAC-2026-001', 'invoice', CURRENT_DATE - 15, CURRENT_DATE + 15, 'paid', 'client', 'Partenaire Festival', 2500, 500, 3000, demo_org_id, demo_user_id)
  RETURNING id INTO inv1_id;

  INSERT INTO finance_invoice_lines (invoice_id, description, quantity, unit_price_excl_tax, vat_rate, amount_excl_tax, amount_vat, amount_incl_tax, order_index, org_id)
  VALUES (inv1_id, 'Prestation communication', 1, 2500, 20, 2500, 500, 3000, 0, demo_org_id);

  -- Budget
  INSERT INTO finance_budgets (year, total_budget, target_events_count, target_revenue, status, org_id, created_by)
  VALUES (fy, 50000, 12, 120000, 'active', demo_org_id, demo_user_id);

  RAISE NOTICE 'Seed démo terminé. Organisation ID: %', demo_org_id;
END $$;
