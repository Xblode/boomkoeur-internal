-- =============================================================================
-- Migration 007 : Products
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('tshirt', 'poster', 'keychain', 'fan', 'other')),
  status TEXT NOT NULL CHECK (status IN ('idea', 'in_production', 'available', 'out_of_stock', 'archived')),
  category TEXT NOT NULL DEFAULT '',
  tags JSONB DEFAULT '[]',
  collection TEXT,
  prices JSONB NOT NULL DEFAULT '{"public": 0, "member": 0, "partner": 0}',
  total_stock INTEGER NOT NULL DEFAULT 0,
  stock_threshold INTEGER NOT NULL DEFAULT 0,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  main_image TEXT,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  size TEXT,
  color TEXT,
  design TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]',
  available_for JSONB DEFAULT '[]',
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'sale', 'return', 'loss', 'adjustment')),
  reference TEXT,
  notes TEXT,
  date DATE NOT NULL,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_providers (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES commercial_contacts(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (product_id, provider_id)
);

CREATE TABLE IF NOT EXISTS public.product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_event_id ON products(event_id);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_org_sku ON products(org_id, sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_org_id ON product_variants(org_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_movements_product_id ON product_stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_movements_org_id ON product_stock_movements(org_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_product_id ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_org_id ON product_comments(org_id);
