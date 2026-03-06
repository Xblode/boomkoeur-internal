-- Ajout du type de contenant au niveau du produit (alcool: fut, cubi, bouteille, canette)
-- Les variantes héritent du même type que le parent
ALTER TABLE public.event_pos_products
  ADD COLUMN IF NOT EXISTS container_type TEXT REFERENCES pos_container_types(id) ON DELETE SET NULL;
