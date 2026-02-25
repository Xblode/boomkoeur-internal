-- =============================================================================
-- Migration : Budgets événements (lignes de budget par événement)
-- =============================================================================

CREATE TABLE IF NOT EXISTS finance_event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  allocated_amount_low NUMERIC(15, 2),
  allocated_amount_high NUMERIC(15, 2),
  actual_amount NUMERIC(15, 2),
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_event_budgets_event_id ON finance_event_budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_finance_event_budgets_org_id ON finance_event_budgets(org_id);

-- RLS
ALTER TABLE finance_event_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_event_budgets_org" ON finance_event_budgets FOR ALL TO authenticated
  USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
