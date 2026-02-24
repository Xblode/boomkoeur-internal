-- Seed des événements de démo (optionnel)
-- Exécuter dans Supabase SQL Editor après la migration

-- Insérer des artistes
INSERT INTO artists (id, name, genre, type) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'DJ Marcus', 'Techno', 'dj'),
  ('a2222222-2222-2222-2222-222222222222', 'Luna Beats', 'Tech House', 'dj'),
  ('a3333333-3333-3333-3333-333333333333', 'Neon Pulse', 'Electro House', 'dj'),
  ('a4444444-4444-4444-4444-444444444444', 'DJ Phoenix', 'Progressive House', 'dj'),
  ('a5555555-5555-5555-5555-555555555555', 'Midnight Crew', 'Trance', 'dj'),
  ('a6666666-6666-6666-6666-666666666666', 'Summer Vibes', 'Deep House', 'dj')
ON CONFLICT (id) DO NOTHING;

-- Insérer des événements (ajuster les UUID si besoin)
INSERT INTO events (id, name, date, end_time, location, description, status, tags) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Soirée Techno Summer Kick-Off', '2026-06-15T22:00:00Z', '02:00', 'Le Warehouse Club', 'Ouverture de la saison estivale avec les meilleurs DJs techno de la région', 'confirmed', '["Summer", "Techno", "Opening"]'),
  ('e2222222-2222-2222-2222-222222222222', 'Electro Night - Festival des Lumières', '2026-08-20T21:00:00Z', '23:00', 'Parc Municipal', 'Grande soirée électro en plein air avec installation lumineuse', 'preparation', '["Electro", "Outdoor", "Light Show"]'),
  ('e3333333-3333-3333-3333-333333333333', 'House Music Marathon', '2026-09-10T20:00:00Z', NULL, 'Club Underground', '12 heures de house non-stop avec 8 artistes', 'idea', '["House", "Marathon", "Club"]'),
  ('e4444444-4444-4444-4444-444444444444', 'New Year Rave 2026', '2025-12-31T23:00:00Z', '03:00', 'Le Warehouse Club', 'Réveillon électro avec 5 DJs et show pyrotechnique', 'completed', '["NYE", "Rave", "Fireworks"]')
ON CONFLICT (id) DO NOTHING;

-- Lier artistes aux événements
INSERT INTO event_artists (event_id, artist_id, performance_time, fee) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '22:00 - 00:00', 800),
  ('e1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', '00:00 - 02:00', 1000),
  ('e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', '21:00 - 23:00', 800),
  ('e4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '23:00 - 01:00', 1500),
  ('e4444444-4444-4444-4444-444444444444', 'a5555555-5555-5555-5555-555555555555', '01:00 - 03:00', 1200)
ON CONFLICT (event_id, artist_id) DO NOTHING;

-- Un commentaire exemple
INSERT INTO event_comments (event_id, author, content) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'Marie', 'Il faut encore obtenir l''autorisation de la mairie pour l''événement en extérieur');
