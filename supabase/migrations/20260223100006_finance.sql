-- =============================================================================
-- Migration 006 : Finance
-- =============================================================================

CREATE TABLE IF NOT EXISTS finance_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'livret')),
  iban TEXT,
  bic TEXT,
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  opening_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT,
  icon TEXT,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT,
  fiscal_year INTEGER NOT NULL,
  date DATE NOT NULL,
  label TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  bank_account_id UUID REFERENCES finance_bank_accounts(id) ON DELETE SET NULL,
  payment_method TEXT,
  piece_number TEXT,
  vat_applicable BOOLEAN NOT NULL DEFAULT false,
  vat_rate NUMERIC(5, 2),
  amount_excl_tax NUMERIC(15, 2),
  debit NUMERIC(15, 2),
  credit NUMERIC(15, 2),
  event_id UUID,
  project_id UUID,
  contact_id UUID,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'reconciled')),
  validated_at TIMESTAMPTZ,
  validated_by TEXT,
  notes TEXT,
  reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciliation_date TIMESTAMPTZ,
  paid_by_member BOOLEAN,
  member_name TEXT,
  reimbursement_status TEXT CHECK (reimbursement_status IN ('not_required', 'pending', 'reimbursed')),
  reimbursement_date TIMESTAMPTZ,
  reimbursement_transaction_id UUID,
  reimbursement_notes TEXT,
  recurring_transaction_id UUID,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  total_budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
  description TEXT,
  target_events_count INTEGER,
  target_revenue NUMERIC(15, 2),
  target_margin NUMERIC(15, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES finance_budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5, 2),
  notes TEXT,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_budget_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('merchandising', 'equipment', 'communication', 'infrastructure', 'development', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  responsible TEXT,
  notes TEXT,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_budget_project_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES finance_budget_projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  allocated_amount_low NUMERIC(15, 2),
  allocated_amount_high NUMERIC(15, 2),
  actual_amount NUMERIC(15, 2),
  notes TEXT,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'quote')),
  issue_date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('quote', 'pending', 'paid', 'overdue', 'cancelled')),
  client_type TEXT CHECK (client_type IN ('client', 'supplier')),
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_postal_code TEXT,
  client_city TEXT,
  client_email TEXT,
  contact_id UUID,
  category TEXT,
  subtotal_excl_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_vat NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_incl_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  payment_method TEXT,
  paid_date DATE,
  notes TEXT,
  pdf_url TEXT,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES finance_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price_excl_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  amount_excl_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  amount_vat NUMERIC(15, 2) NOT NULL DEFAULT 0,
  amount_incl_tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_treasury_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  label TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  category TEXT NOT NULL,
  certainty_level TEXT NOT NULL CHECK (certainty_level IN ('confirmed', 'probable', 'uncertain')),
  bank_account_id UUID REFERENCES finance_bank_accounts(id) ON DELETE SET NULL,
  notes TEXT,
  realized BOOLEAN NOT NULL DEFAULT false,
  transaction_id UUID,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  org_id UUID REFERENCES organisations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_budget_template_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES finance_budget_templates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  org_id UUID REFERENCES organisations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_fiscal_year ON finance_transactions(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(date);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_org_id ON finance_transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_finance_bank_accounts_org_id ON finance_bank_accounts(org_id);
CREATE INDEX IF NOT EXISTS idx_finance_budget_categories_budget_id ON finance_budget_categories(budget_id);
CREATE INDEX IF NOT EXISTS idx_finance_budget_project_lines_project_id ON finance_budget_project_lines(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoice_lines_invoice_id ON finance_invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON finance_invoices(status);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_org_id ON finance_invoices(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_invoices_org_number ON finance_invoices(org_id, invoice_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_budgets_org_year ON finance_budgets(org_id, year);
