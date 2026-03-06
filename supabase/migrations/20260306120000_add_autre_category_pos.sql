-- Ajouter 'autre' aux catégories POS autorisées
ALTER TABLE public.event_pos_products DROP CONSTRAINT IF EXISTS event_pos_products_category_check;
ALTER TABLE public.event_pos_products ADD CONSTRAINT event_pos_products_category_check
  CHECK (category IN ('alcool', 'merch', 'billet', 'autre'));
