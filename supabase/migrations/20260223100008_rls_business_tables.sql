-- =============================================================================
-- Migration 008 : RLS sur les tables metier (filtrage par org_id)
-- =============================================================================

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Events select" ON public.events;
DROP POLICY IF EXISTS "Events insert" ON public.events;
DROP POLICY IF EXISTS "Events update" ON public.events;
DROP POLICY IF EXISTS "Events delete" ON public.events;
CREATE POLICY "events_select_org" ON public.events FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "events_insert_org" ON public.events FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "events_update_org" ON public.events FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "events_delete_org" ON public.events FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- Artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artists select" ON public.artists;
DROP POLICY IF EXISTS "Artists insert" ON public.artists;
DROP POLICY IF EXISTS "Artists update" ON public.artists;
DROP POLICY IF EXISTS "Artists delete" ON public.artists;
CREATE POLICY "artists_select_org" ON public.artists FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "artists_insert_org" ON public.artists FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "artists_update_org" ON public.artists FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "artists_delete_org" ON public.artists FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- Event comments
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Event_comments select" ON public.event_comments;
DROP POLICY IF EXISTS "Event_comments insert" ON public.event_comments;
DROP POLICY IF EXISTS "Event_comments update" ON public.event_comments;
DROP POLICY IF EXISTS "Event_comments delete" ON public.event_comments;
CREATE POLICY "event_comments_select_org" ON public.event_comments FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "event_comments_insert_org" ON public.event_comments FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "event_comments_update_org" ON public.event_comments FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "event_comments_delete_org" ON public.event_comments FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- event_artists (pas de org_id, herite de events)
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Event_artists select" ON public.event_artists;
DROP POLICY IF EXISTS "Event_artists insert" ON public.event_artists;
DROP POLICY IF EXISTS "Event_artists update" ON public.event_artists;
DROP POLICY IF EXISTS "Event_artists delete" ON public.event_artists;
CREATE POLICY "event_artists_select" ON public.event_artists FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_artists_insert" ON public.event_artists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "event_artists_update" ON public.event_artists FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "event_artists_delete" ON public.event_artists FOR DELETE TO authenticated USING (true);

-- Meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Meetings select" ON public.meetings;
DROP POLICY IF EXISTS "Meetings insert" ON public.meetings;
DROP POLICY IF EXISTS "Meetings update" ON public.meetings;
DROP POLICY IF EXISTS "Meetings delete" ON public.meetings;
CREATE POLICY "meetings_select_org" ON public.meetings FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "meetings_insert_org" ON public.meetings FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "meetings_update_org" ON public.meetings FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "meetings_delete_org" ON public.meetings FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- Commercial
ALTER TABLE public.commercial_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Commercial contacts select" ON public.commercial_contacts;
DROP POLICY IF EXISTS "Commercial contacts insert" ON public.commercial_contacts;
DROP POLICY IF EXISTS "Commercial contacts update" ON public.commercial_contacts;
DROP POLICY IF EXISTS "Commercial contacts delete" ON public.commercial_contacts;
CREATE POLICY "commercial_contacts_select_org" ON public.commercial_contacts FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "commercial_contacts_insert_org" ON public.commercial_contacts FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "commercial_contacts_update_org" ON public.commercial_contacts FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "commercial_contacts_delete_org" ON public.commercial_contacts FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

ALTER TABLE public.contact_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contact notes select" ON public.contact_notes;
DROP POLICY IF EXISTS "Contact notes insert" ON public.contact_notes;
DROP POLICY IF EXISTS "Contact notes update" ON public.contact_notes;
DROP POLICY IF EXISTS "Contact notes delete" ON public.contact_notes;
CREATE POLICY "contact_notes_select_org" ON public.contact_notes FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "contact_notes_insert_org" ON public.contact_notes FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "contact_notes_update_org" ON public.contact_notes FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "contact_notes_delete_org" ON public.contact_notes FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

-- Finance
ALTER TABLE finance_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budget_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budget_project_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_treasury_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_budget_template_lines ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'finance_%') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "finance_bank_accounts_org" ON finance_bank_accounts FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_transactions_org" ON finance_transactions FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_transaction_categories_org" ON finance_transaction_categories FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_budgets_org" ON finance_budgets FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_budget_categories_org" ON finance_budget_categories FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_budget_projects_org" ON finance_budget_projects FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_budget_project_lines_org" ON finance_budget_project_lines FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_invoices_org" ON finance_invoices FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_invoice_lines_org" ON finance_invoice_lines FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_treasury_forecasts_org" ON finance_treasury_forecasts FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_budget_templates_org" ON finance_budget_templates FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "finance_budget_template_lines_org" ON finance_budget_template_lines FOR ALL TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products select" ON public.products;
DROP POLICY IF EXISTS "Products insert" ON public.products;
DROP POLICY IF EXISTS "Products update" ON public.products;
DROP POLICY IF EXISTS "Products delete" ON public.products;
CREATE POLICY "products_select_org" ON public.products FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "products_insert_org" ON public.products FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "products_update_org" ON public.products FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "products_delete_org" ON public.products FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

DROP POLICY IF EXISTS "Product variants select" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants insert" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants update" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants delete" ON public.product_variants;
CREATE POLICY "product_variants_select_org" ON public.product_variants FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "product_variants_insert_org" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "product_variants_update_org" ON public.product_variants FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "product_variants_delete_org" ON public.product_variants FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

DROP POLICY IF EXISTS "Product stock movements select" ON public.product_stock_movements;
DROP POLICY IF EXISTS "Product stock movements insert" ON public.product_stock_movements;
DROP POLICY IF EXISTS "Product stock movements update" ON public.product_stock_movements;
DROP POLICY IF EXISTS "Product stock movements delete" ON public.product_stock_movements;
CREATE POLICY "product_stock_movements_select_org" ON public.product_stock_movements FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "product_stock_movements_insert_org" ON public.product_stock_movements FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "product_stock_movements_update_org" ON public.product_stock_movements FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "product_stock_movements_delete_org" ON public.product_stock_movements FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));

DROP POLICY IF EXISTS "Product providers select" ON public.product_providers;
DROP POLICY IF EXISTS "Product providers insert" ON public.product_providers;
DROP POLICY IF EXISTS "Product providers update" ON public.product_providers;
DROP POLICY IF EXISTS "Product providers delete" ON public.product_providers;
CREATE POLICY "product_providers_select" ON public.product_providers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.user_belongs_to_org(p.org_id)));
CREATE POLICY "product_providers_insert" ON public.product_providers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.user_belongs_to_org(p.org_id)));
CREATE POLICY "product_providers_update" ON public.product_providers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.user_belongs_to_org(p.org_id)));
CREATE POLICY "product_providers_delete" ON public.product_providers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND public.user_belongs_to_org(p.org_id)));

DROP POLICY IF EXISTS "Product comments select" ON public.product_comments;
DROP POLICY IF EXISTS "Product comments insert" ON public.product_comments;
DROP POLICY IF EXISTS "Product comments update" ON public.product_comments;
DROP POLICY IF EXISTS "Product comments delete" ON public.product_comments;
CREATE POLICY "product_comments_select_org" ON public.product_comments FOR SELECT TO authenticated USING (public.user_belongs_to_org(org_id));
CREATE POLICY "product_comments_insert_org" ON public.product_comments FOR INSERT TO authenticated WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "product_comments_update_org" ON public.product_comments FOR UPDATE TO authenticated USING (public.user_belongs_to_org(org_id)) WITH CHECK (public.user_belongs_to_org(org_id));
CREATE POLICY "product_comments_delete_org" ON public.product_comments FOR DELETE TO authenticated USING (public.user_belongs_to_org(org_id));
