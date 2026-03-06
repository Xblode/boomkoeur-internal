-- Ajouter sale_time pour le graphique CA par tranche horaire
ALTER TABLE public.event_pos_sales ADD COLUMN IF NOT EXISTS sale_time TIME;
