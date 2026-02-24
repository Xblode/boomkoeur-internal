-- =============================================================================
-- Migration 005 : Commercial (CRM)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.commercial_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('supplier', 'contact', 'partner')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'lead')),
  name TEXT NOT NULL DEFAULT '',
  company TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  website TEXT,
  address JSONB DEFAULT '{}',
  contact_person TEXT,
  position TEXT,
  linked_product_ids JSONB DEFAULT '[]',
  linked_order_ids JSONB DEFAULT '[]',
  linked_invoice_ids JSONB DEFAULT '[]',
  notes TEXT,
  tags JSONB DEFAULT '[]',
  last_contact_at TIMESTAMPTZ,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES commercial_contacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commercial_contacts_type ON commercial_contacts(type);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_status ON commercial_contacts(status);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_name ON commercial_contacts(name);
CREATE INDEX IF NOT EXISTS idx_commercial_contacts_org_id ON commercial_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contact_notes_contact_id ON contact_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_notes_org_id ON contact_notes(org_id);
