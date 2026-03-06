-- =============================================================================
-- Migration : Point de Vente par Event (consolidée)
-- Tables : pos_container_types, pos_sale_units, event_pos_products,
--          event_pos_variants, event_pos_sales, event_pos_cash_totals
-- =============================================================================

-- Référence : types de contenant (alcool)
CREATE TABLE IF NOT EXISTS public.pos_container_types (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO public.pos_container_types (id, label, sort_order) VALUES
  ('fut', 'Fut', 1),
  ('cubi', 'Cubi', 2),
  ('bouteille', 'Bouteille', 3),
  ('canette', 'Canette', 4)
ON CONFLICT (id) DO NOTHING;

-- Référence : unités de vente (25cl, 50cl, etc.)
CREATE TABLE IF NOT EXISTS public.pos_sale_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_cl INTEGER NOT NULL,
  label TEXT NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  org_id UUID REFERENCES organisations(id)
);

CREATE INDEX IF NOT EXISTS idx_pos_sale_units_org ON pos_sale_units(org_id);

INSERT INTO public.pos_sale_units (value_cl, label, is_custom, org_id)
SELECT 25, '25 cl', false, NULL WHERE NOT EXISTS (SELECT 1 FROM pos_sale_units WHERE value_cl = 25 AND org_id IS NULL);
INSERT INTO public.pos_sale_units (value_cl, label, is_custom, org_id)
SELECT 33, '33 cl', false, NULL WHERE NOT EXISTS (SELECT 1 FROM pos_sale_units WHERE value_cl = 33 AND org_id IS NULL);
INSERT INTO public.pos_sale_units (value_cl, label, is_custom, org_id)
SELECT 50, '50 cl', false, NULL WHERE NOT EXISTS (SELECT 1 FROM pos_sale_units WHERE value_cl = 50 AND org_id IS NULL);
INSERT INTO public.pos_sale_units (value_cl, label, is_custom, org_id)
SELECT 75, '75 cl', false, NULL WHERE NOT EXISTS (SELECT 1 FROM pos_sale_units WHERE value_cl = 75 AND org_id IS NULL);
INSERT INTO public.pos_sale_units (value_cl, label, is_custom, org_id)
SELECT 100, '1 L', false, NULL WHERE NOT EXISTS (SELECT 1 FROM pos_sale_units WHERE value_cl = 100 AND org_id IS NULL);

-- Produits POS par event
CREATE TABLE IF NOT EXISTS public.event_pos_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('alcool', 'merch', 'billet')),
  container_type TEXT REFERENCES pos_container_types(id) ON DELETE SET NULL,
  container_capacity_cl INTEGER,
  purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  has_stock BOOLEAN NOT NULL DEFAULT true,
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_pos_products_event ON event_pos_products(event_id);
CREATE INDEX IF NOT EXISTS idx_event_pos_products_org ON event_pos_products(org_id);

-- Variantes (merch: size/color/design | alcool: sale_unit_cl)
CREATE TABLE IF NOT EXISTS public.event_pos_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_pos_product_id UUID NOT NULL REFERENCES event_pos_products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  design TEXT,
  container_type TEXT REFERENCES pos_container_types(id) ON DELETE SET NULL,
  sale_unit_cl INTEGER,
  sale_unit_id UUID REFERENCES pos_sale_units(id) ON DELETE SET NULL,
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  stock_initial INTEGER NOT NULL DEFAULT 0,
  stock_final INTEGER,
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_pos_variants_product ON event_pos_variants(event_pos_product_id);
CREATE INDEX IF NOT EXISTS idx_event_pos_variants_org ON event_pos_variants(org_id);

-- Colonnes manquantes (si tables créées par anciennes migrations)
ALTER TABLE public.event_pos_products ADD COLUMN IF NOT EXISTS container_type TEXT REFERENCES pos_container_types(id) ON DELETE SET NULL;
ALTER TABLE public.event_pos_products ADD COLUMN IF NOT EXISTS container_capacity_cl INTEGER;
ALTER TABLE public.event_pos_products ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.event_pos_variants ADD COLUMN IF NOT EXISTS price NUMERIC(15, 2) NOT NULL DEFAULT 0;

-- Ventes (import CSV ou manuel)
CREATE TABLE IF NOT EXISTS public.event_pos_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_pos_product_id UUID NOT NULL REFERENCES event_pos_products(id) ON DELETE CASCADE,
  event_pos_variant_id UUID REFERENCES event_pos_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(15, 2) NOT NULL,
  total NUMERIC(15, 2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('card', 'cash')),
  source TEXT NOT NULL CHECK (source IN ('import_csv', 'manual')),
  reference TEXT,
  sale_date DATE NOT NULL,
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_pos_sales_event ON event_pos_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_event_pos_sales_product ON event_pos_sales(event_pos_product_id);
CREATE INDEX IF NOT EXISTS idx_event_pos_sales_org ON event_pos_sales(org_id);

-- Total cash global
CREATE TABLE IF NOT EXISTS public.event_pos_cash_totals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  total_amount NUMERIC(15, 2) NOT NULL,
  notes TEXT,
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_pos_cash_totals_event ON event_pos_cash_totals(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_pos_cash_totals_event_unique ON event_pos_cash_totals(event_id);

-- RLS
ALTER TABLE public.event_pos_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_pos_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_pos_cash_totals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_pos_products_org" ON event_pos_products;
CREATE POLICY "event_pos_products_org" ON event_pos_products FOR ALL TO authenticated
  USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));

DROP POLICY IF EXISTS "event_pos_variants_org" ON event_pos_variants;
CREATE POLICY "event_pos_variants_org" ON event_pos_variants FOR ALL TO authenticated
  USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));

DROP POLICY IF EXISTS "event_pos_sales_org" ON event_pos_sales;
CREATE POLICY "event_pos_sales_org" ON event_pos_sales FOR ALL TO authenticated
  USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));

DROP POLICY IF EXISTS "event_pos_cash_totals_org" ON event_pos_cash_totals;
CREATE POLICY "event_pos_cash_totals_org" ON event_pos_cash_totals FOR ALL TO authenticated
  USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
