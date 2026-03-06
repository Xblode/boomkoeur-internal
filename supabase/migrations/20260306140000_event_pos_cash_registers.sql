-- Caisses multiples avec fond de caisse (remplace event_pos_cash_totals)
CREATE TABLE IF NOT EXISTS public.event_pos_cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  closing_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_pos_cash_registers_event ON event_pos_cash_registers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_pos_cash_registers_org ON event_pos_cash_registers(org_id);

-- RLS
ALTER TABLE public.event_pos_cash_registers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_pos_cash_registers_org" ON event_pos_cash_registers;
CREATE POLICY "event_pos_cash_registers_org" ON event_pos_cash_registers FOR ALL TO authenticated
  USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));

-- Migration des données existantes (une caisse par défaut)
INSERT INTO public.event_pos_cash_registers (event_id, name, initial_amount, closing_amount, notes, sort_order, org_id)
SELECT event_id, 'Caisse', 0, total_amount, notes, 0, org_id
FROM public.event_pos_cash_totals;
