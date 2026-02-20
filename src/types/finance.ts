// =====================================================
// FINANCE - TYPES
// =====================================================

// Finance - Bank Account
export type BankAccount = {
  id: string
  name: string
  bank_name: string
  account_type: 'checking' | 'savings' | 'livret'
  iban?: string
  bic?: string
  initial_balance: number
  current_balance: number
  opening_date?: Date | string
  is_active: boolean
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Transaction
export type Transaction = {
  id: string
  entry_number?: string // Format: 2025-0001
  fiscal_year: number
  date: Date | string
  label: string
  amount: number
  type: 'income' | 'expense'
  category: string
  bank_account_id?: string
  payment_method?: string
  piece_number?: string
  vat_applicable: boolean
  vat_rate?: number
  amount_excl_tax?: number
  debit?: number
  credit?: number
  event_id?: string
  project_id?: string
  contact_id?: string
  attachment_url?: string
  status: 'pending' | 'validated' | 'reconciled'
  validated_at?: Date | string
  validated_by?: string
  notes?: string
  reconciled: boolean
  reconciliation_date?: Date | string
  // Gestion des remboursements (avances personnelles)
  paid_by_member?: boolean
  member_name?: string
  reimbursement_status?: 'not_required' | 'pending' | 'reimbursed'
  reimbursement_date?: Date | string
  reimbursement_transaction_id?: string
  reimbursement_notes?: string
  // Transaction récurrente
  recurring_transaction_id?: string
  created_by?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Recurring Transaction
export type RecurringTransaction = {
  id: string
  label: string
  amount: number
  type: 'income' | 'expense'
  category: string
  bank_account_id?: string
  payment_method?: string
  vat_applicable: boolean
  vat_rate?: number
  amount_excl_tax?: number
  notes?: string
  frequency: 'monthly' | 'quarterly' | 'yearly'
  day_of_month: number // 1-31
  start_date: Date | string
  end_date?: Date | string
  is_active: boolean
  next_occurrence_date?: Date | string
  last_generated_date?: Date | string
  created_by?: string
  created_at: Date | string
  updated_at: Date | string
}

export type RecurringTransactionInput = Omit<
  RecurringTransaction,
  'id' | 'created_at' | 'updated_at' | 'next_occurrence_date' | 'last_generated_date'
>

// Finance - Transaction Category
export type TransactionCategory = {
  id: string
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
  description?: string
  is_default: boolean
  is_active: boolean
  sort_order: number
  created_by?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Budget
export type Budget = {
  id: string
  year: number
  total_budget: number
  description?: string
  target_events_count?: number
  target_revenue?: number
  target_margin?: number
  status: 'active' | 'archived'
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Budget Category
export type BudgetCategory = {
  id: string
  budget_id: string
  category: string
  allocated_amount: number
  spent_amount: number
  percentage?: number
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Event Budget
export type EventBudget = {
  id: string
  event_id: string
  category: string
  type: 'income' | 'expense'
  allocated_amount: number // Estimation moyenne (réaliste)
  allocated_amount_low?: number // Estimation basse (pessimiste)
  allocated_amount_high?: number // Estimation haute (optimiste)
  actual_amount?: number
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Event Budget with Event Info
export type EventBudgetWithEvent = EventBudget & {
  event_title?: string
  event_date?: Date | string
  event_status?: string
}

// Finance - Event Budget Summary
export type EventBudgetSummary = {
  event_id: string
  event_title: string
  event_date: Date | string
  event_status: string
  total_revenue_allocated: number // Estimation moyenne
  total_revenue_allocated_low?: number // Estimation basse
  total_revenue_allocated_high?: number // Estimation haute
  total_revenue_actual: number
  total_expense_allocated: number // Estimation moyenne
  total_expense_allocated_low?: number // Estimation basse
  total_expense_allocated_high?: number // Estimation haute
  total_expense_actual: number
  result_allocated: number // Résultat moyen
  result_allocated_low?: number // Résultat bas
  result_allocated_high?: number // Résultat haut
  result_actual: number
  budgets: EventBudget[]
}

// Finance - Budget Template
export type BudgetTemplate = {
  id: string
  name: string
  description?: string
  icon?: string
  is_default: boolean
  created_by?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Budget Template Line
export type BudgetTemplateLine = {
  id: string
  template_id: string
  category: string
  type: 'income' | 'expense'
  allocated_amount: number
  sort_order: number
  created_at: Date | string
}

// Finance - Budget Template with Lines
export type BudgetTemplateWithLines = BudgetTemplate & {
  lines: BudgetTemplateLine[]
}

// Finance - Budget Project
export type BudgetProject = {
  id: string
  title: string
  description?: string
  type: 'merchandising' | 'equipment' | 'communication' | 'infrastructure' | 'development' | 'other'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  start_date?: Date | string
  end_date?: Date | string
  responsible?: string
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Budget Project Line
export type BudgetProjectLine = {
  id: string
  project_id: string
  category: string
  type: 'income' | 'expense'
  allocated_amount: number
  allocated_amount_low?: number
  allocated_amount_high?: number
  actual_amount?: number
  notes?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Budget Project Summary
export type BudgetProjectSummary = {
  project_id: string
  project_title: string
  project_type: string
  project_status: string
  total_revenue_allocated: number
  total_revenue_allocated_low?: number
  total_revenue_allocated_high?: number
  total_revenue_actual: number
  total_expense_allocated: number
  total_expense_allocated_low?: number
  total_expense_allocated_high?: number
  total_expense_actual: number
  result_allocated: number
  result_allocated_low?: number
  result_allocated_high?: number
  result_actual: number
  lines?: BudgetProjectLine[]
}

// Finance - Invoice
export type Invoice = {
  id: string
  invoice_number: string
  type: 'invoice' | 'quote'
  issue_date: Date | string
  due_date?: Date | string
  status: 'quote' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  client_type?: 'client' | 'supplier'
  client_name: string
  client_address?: string
  client_postal_code?: string
  client_city?: string
  client_email?: string
  contact_id?: string
  category?: string
  subtotal_excl_tax: number
  total_vat: number
  total_incl_tax: number
  payment_terms?: string
  payment_method?: string
  paid_date?: Date | string
  notes?: string
  pdf_url?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance - Invoice Line
export type InvoiceLine = {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price_excl_tax: number
  vat_rate: number
  amount_excl_tax: number
  amount_vat: number
  amount_incl_tax: number
  order_index: number
  created_at: Date | string
}

// Finance - Treasury Forecast
export type TreasuryForecast = {
  id: string
  date: Date | string
  type: 'income' | 'expense'
  label: string
  amount: number
  category: string
  certainty_level: 'confirmed' | 'probable' | 'uncertain'
  bank_account_id?: string
  notes?: string
  realized: boolean
  transaction_id?: string
  created_at: Date | string
  updated_at: Date | string
}

// Finance KPIs
export type FinanceKPIs = {
  currentBalance: number
  monthlyRevenue: number
  monthlyExpense: number
  subsidy: number
  membership: number
  remainingBudget: number
  trends: {
    revenue: Array<{ month: string; value: number }>
    expense: Array<{ month: string; value: number }>
    balance: Array<{ month: string; value: number }>
  }
}

// Profit and Loss Statement
export type ProfitAndLoss = {
  period: string
  revenue: {
    billetterie: number
    bar: number
    merchandising: number
    subventions: number
    adhesions: number
    autres: number
    total: number
  }
  expenses: {
    cachets: number
    location: number
    technique: number
    communication: number
    salaires: number
    charges: number
    autres: number
    total: number
  }
  grossMargin: number
  operatingResult: number
}

// Balance Sheet
export type BalanceSheet = {
  period: string
  assets: {
    cash: number
    receivables: number
    inventory: number
    equipment: number
    total: number
  }
  liabilities: {
    payables: number
    loans: number
    provisions: number
    equity: number
    total: number
  }
}

// Financial Ratios
export type FinancialRatios = {
  liquidityRatio: number
  autonomyRatio: number
  roi: number
  marginRate: number
}
