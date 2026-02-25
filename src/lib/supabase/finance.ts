/**
 * Service Finance - Supabase
 * Remplace lib/services/FinanceDataService (localStorage) et lib/stubs/supabase-stubs pour le module Finance
 */

import { supabase } from './client';
import { generateUniqueCode } from '@/lib/utils/generateCode';
import { getActiveOrgId } from './activeOrg';
import type {
  BankAccount,
  Transaction,
  TransactionCategory,
  Budget,
  BudgetCategory,
  BudgetProject,
  BudgetProjectLine,
  EventBudget,
  Invoice,
  InvoiceLine,
  TreasuryForecast,
  BudgetTemplate,
  BudgetTemplateLine,
  BudgetTemplateWithLines,
  FinanceKPIs,
  ProfitAndLoss,
  BalanceSheet,
  FinancialRatios,
} from '@/types/finance';

// --- Bank Accounts ---

export async function getBankAccounts(): Promise<BankAccount[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('finance_bank_accounts').select('*').eq('is_active', true);
  if (orgId) query = query.eq('org_id', orgId);
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDbBankAccount);
}

export async function getBankAccountById(id: string): Promise<BankAccount | null> {
  const { data, error } = await supabase
    .from('finance_bank_accounts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapDbBankAccount(data);
}

export async function createBankAccount(
  input: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>
): Promise<BankAccount> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('finance_bank_accounts')
    .insert({
      name: input.name,
      bank_name: input.bank_name,
      account_type: input.account_type,
      iban: input.iban ?? null,
      bic: input.bic ?? null,
      initial_balance: input.initial_balance,
      current_balance: input.current_balance ?? input.initial_balance,
      opening_date: input.opening_date ?? null,
      is_active: input.is_active ?? true,
      notes: input.notes ?? null,
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbBankAccount(data);
}

export async function updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const allowed = ['name', 'bank_name', 'account_type', 'iban', 'bic', 'initial_balance', 'current_balance', 'opening_date', 'is_active', 'notes'];
  for (const k of allowed) {
    const v = (updates as Record<string, unknown>)[k];
    if (v !== undefined) payload[k] = v;
  }
  const { data, error } = await supabase.from('finance_bank_accounts').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapDbBankAccount(data);
}

export async function deleteBankAccount(id: string): Promise<void> {
  const { error } = await supabase.from('finance_bank_accounts').delete().eq('id', id);
  if (error) throw error;
}

function mapDbBankAccount(row: Record<string, unknown>): BankAccount {
  return {
    id: row.id as string,
    name: row.name as string,
    bank_name: row.bank_name as string,
    account_type: row.account_type as BankAccount['account_type'],
    iban: (row.iban as string) ?? undefined,
    bic: (row.bic as string) ?? undefined,
    initial_balance: Number(row.initial_balance ?? 0),
    current_balance: Number(row.current_balance ?? 0),
    opening_date: (row.opening_date as string) ?? undefined,
    is_active: Boolean(row.is_active ?? true),
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Transactions ---

export async function getTransactions(year?: number): Promise<Transaction[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('finance_transactions').select('*');
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('date', { ascending: false });
  if (year) query = query.eq('fiscal_year', year);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapDbTransaction);
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase.from('finance_transactions').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbTransaction(data);
}

export async function createTransaction(
  input: Omit<Transaction, 'id' | 'entry_number' | 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const id = crypto.randomUUID();
  const entry_number = generateUniqueCode('TRA', id, 8);
  const fiscal_year = input.fiscal_year ?? new Date(input.date).getFullYear();
  const debit = input.type === 'expense' ? input.amount : 0;
  const credit = input.type === 'income' ? input.amount : 0;

  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('finance_transactions')
    .insert({
      id,
      entry_number,
      fiscal_year,
      date: typeof input.date === 'string' ? input.date : (input.date as Date).toISOString().slice(0, 10),
      label: input.label,
      amount: input.amount,
      type: input.type,
      category: input.category,
      bank_account_id: input.bank_account_id ?? null,
      payment_method: input.payment_method ?? null,
      piece_number: input.piece_number ?? null,
      vat_applicable: input.vat_applicable ?? false,
      vat_rate: input.vat_rate ?? null,
      amount_excl_tax: input.amount_excl_tax ?? null,
      debit,
      credit,
      event_id: input.event_id ?? null,
      project_id: input.project_id ?? null,
      contact_id: input.contact_id ?? null,
      attachment_url: input.attachment_url ?? null,
      status: input.status ?? 'pending',
      notes: input.notes ?? null,
      reconciled: input.reconciled ?? false,
      paid_by_member: input.paid_by_member ?? null,
      member_name: input.member_name ?? null,
      reimbursement_status: input.reimbursement_status ?? null,
      reimbursement_date: input.reimbursement_date ?? null,
      reimbursement_transaction_id: input.reimbursement_transaction_id ?? null,
      reimbursement_notes: input.reimbursement_notes ?? null,
      recurring_transaction_id: input.recurring_transaction_id ?? null,
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbTransaction(data);
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const skip = ['id', 'created_at', 'created_by'];
  for (const [k, v] of Object.entries(updates)) {
    if (skip.includes(k)) continue;
    if (v !== undefined) payload[k] = v;
  }
  const { data, error } = await supabase.from('finance_transactions').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapDbTransaction(data);
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('finance_transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function validateTransaction(id: string, userId?: string): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  const uid = userId ?? user?.id ?? '';
  return updateTransaction(id, {
    status: 'validated',
    validated_at: new Date().toISOString(),
    validated_by: uid,
  });
}

export async function reconcileTransaction(id: string): Promise<Transaction> {
  return updateTransaction(id, {
    status: 'reconciled',
    reconciled: true,
    reconciliation_date: new Date().toISOString(),
  });
}

function mapDbTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    entry_number: (row.entry_number as string) ?? undefined,
    fiscal_year: Number(row.fiscal_year),
    date: row.date as string,
    label: row.label as string,
    amount: Number(row.amount),
    type: row.type as 'income' | 'expense',
    category: row.category as string,
    bank_account_id: (row.bank_account_id as string) ?? undefined,
    payment_method: (row.payment_method as string) ?? undefined,
    piece_number: (row.piece_number as string) ?? undefined,
    vat_applicable: Boolean(row.vat_applicable),
    vat_rate: row.vat_rate != null ? Number(row.vat_rate) : undefined,
    amount_excl_tax: row.amount_excl_tax != null ? Number(row.amount_excl_tax) : undefined,
    debit: row.debit != null ? Number(row.debit) : undefined,
    credit: row.credit != null ? Number(row.credit) : undefined,
    event_id: (row.event_id as string) ?? undefined,
    project_id: (row.project_id as string) ?? undefined,
    contact_id: (row.contact_id as string) ?? undefined,
    attachment_url: (row.attachment_url as string) ?? undefined,
    status: (row.status as Transaction['status']) ?? 'pending',
    validated_at: (row.validated_at as string) ?? undefined,
    validated_by: (row.validated_by as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    reconciled: Boolean(row.reconciled ?? false),
    reconciliation_date: (row.reconciliation_date as string) ?? undefined,
    paid_by_member: row.paid_by_member != null ? Boolean(row.paid_by_member) : undefined,
    member_name: (row.member_name as string) ?? undefined,
    reimbursement_status: (row.reimbursement_status as Transaction['reimbursement_status']) ?? undefined,
    reimbursement_date: (row.reimbursement_date as string) ?? undefined,
    reimbursement_transaction_id: (row.reimbursement_transaction_id as string) ?? undefined,
    reimbursement_notes: (row.reimbursement_notes as string) ?? undefined,
    recurring_transaction_id: (row.recurring_transaction_id as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Transaction Categories ---

export async function getTransactionCategories(type?: 'income' | 'expense'): Promise<TransactionCategory[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('finance_transaction_categories').select('*').eq('is_active', true);
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('sort_order');
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  const categories = (data ?? []).map(mapDbTransactionCategory);
  if (categories.length === 0) {
    await seedDefaultTransactionCategories();
    return getTransactionCategories(type);
  }
  return categories;
}

async function seedDefaultTransactionCategories(): Promise<void> {
  const defaults = [
    { name: 'Billetterie', type: 'income', sort_order: 1 },
    { name: 'Bar', type: 'income', sort_order: 2 },
    { name: 'Merchandising', type: 'income', sort_order: 3 },
    { name: 'Subventions', type: 'income', sort_order: 4 },
    { name: 'Cachets artistes', type: 'expense', sort_order: 1 },
    { name: 'Location', type: 'expense', sort_order: 2 },
    { name: 'Technique', type: 'expense', sort_order: 3 },
    { name: 'Communication', type: 'expense', sort_order: 4 },
  ];
  for (const c of defaults) {
    await supabase.from('finance_transaction_categories').insert({
      name: c.name,
      type: c.type,
      is_default: true,
      is_active: true,
      sort_order: c.sort_order,
      org_id: getActiveOrgId(),
    });
  }
}

export async function createTransactionCategory(
  input: Omit<TransactionCategory, 'id' | 'created_at' | 'updated_at'>
): Promise<TransactionCategory> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('finance_transaction_categories')
    .insert({
      name: input.name,
      type: input.type,
      color: input.color ?? null,
      icon: input.icon ?? null,
      description: input.description ?? null,
      is_default: input.is_default ?? false,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbTransactionCategory(data);
}

export async function updateTransactionCategory(id: string, updates: Partial<TransactionCategory>): Promise<TransactionCategory> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(updates)) {
    if (['id', 'created_at'].includes(k)) continue;
    if (v !== undefined) payload[k] = v;
  }
  const { data, error } = await supabase.from('finance_transaction_categories').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapDbTransactionCategory(data);
}

export async function deleteTransactionCategory(id: string): Promise<TransactionCategory> {
  return updateTransactionCategory(id, { is_active: false });
}

function mapDbTransactionCategory(row: Record<string, unknown>): TransactionCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as 'income' | 'expense',
    color: (row.color as string) ?? undefined,
    icon: (row.icon as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    is_default: Boolean(row.is_default ?? false),
    is_active: Boolean(row.is_active ?? true),
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Budgets ---

export async function getBudgets(): Promise<(Budget & { categories: BudgetCategory[] })[]> {
  const orgId = getActiveOrgId();
  let bQuery = supabase.from('finance_budgets').select('*');
  if (orgId) bQuery = bQuery.eq('org_id', orgId);
  const { data: budgets, error: e1 } = await bQuery.order('year', { ascending: false });
  if (e1) throw e1;
  const { data: categories, error: e2 } = await supabase.from('finance_budget_categories').select('*');
  if (e2) throw e2;
  const catList = (categories ?? []) as Record<string, unknown>[];
  return (budgets ?? []).map((b: Record<string, unknown>) => ({
    ...mapDbBudget(b),
    categories: catList.filter((c) => c.budget_id === b.id).map(mapDbBudgetCategory),
  }));
}

export async function getBudgetByYear(year: number): Promise<(Budget & { categories: BudgetCategory[] }) | null> {
  const { data: budget, error: e1 } = await supabase.from('finance_budgets').select('*').eq('year', year).single();
  if (e1 || !budget) return null;
  const { data: categories } = await supabase.from('finance_budget_categories').select('*').eq('budget_id', budget.id);
  return {
    ...mapDbBudget(budget),
    categories: (categories ?? []).map((c: Record<string, unknown>) => mapDbBudgetCategory(c)),
  };
}

export async function createBudget(data: {
  budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
  categories: Omit<BudgetCategory, 'id' | 'budget_id' | 'created_at' | 'updated_at'>[];
}): Promise<Budget & { categories: BudgetCategory[] }> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: inserted, error: e1 } = await supabase
    .from('finance_budgets')
    .insert({
      year: data.budget.year,
      total_budget: data.budget.total_budget,
      description: data.budget.description ?? null,
      target_events_count: data.budget.target_events_count ?? null,
      target_revenue: data.budget.target_revenue ?? null,
      target_margin: data.budget.target_margin ?? null,
      status: data.budget.status ?? 'active',
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();
  if (e1) throw e1;
  const budgetId = (inserted as Record<string, unknown>).id as string;
  const newCategories: BudgetCategory[] = [];
  for (let i = 0; i < data.categories.length; i++) {
    const c = data.categories[i];
    const { data: line } = await supabase
      .from('finance_budget_categories')
      .insert({
        budget_id: budgetId,
        category: c.category,
        allocated_amount: c.allocated_amount,
        spent_amount: 0,
        notes: c.notes ?? null,
        org_id: getActiveOrgId(),
      })
      .select()
      .single();
    if (line) newCategories.push(mapDbBudgetCategory(line as Record<string, unknown>));
  }
  return { ...mapDbBudget(inserted as Record<string, unknown>), categories: newCategories };
}

export async function updateBudget(
  id: string,
  data: {
    total_budget?: number;
    description?: string;
    target_events_count?: number;
    target_revenue?: number;
    target_margin?: number;
    categories?: { category: string; allocated_amount: number; notes?: string }[];
  }
): Promise<Budget & { categories: BudgetCategory[] }> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.total_budget !== undefined) payload.total_budget = data.total_budget;
  if (data.description !== undefined) payload.description = data.description;
  if (data.target_events_count !== undefined) payload.target_events_count = data.target_events_count;
  if (data.target_revenue !== undefined) payload.target_revenue = data.target_revenue;
  if (data.target_margin !== undefined) payload.target_margin = data.target_margin;
  await supabase.from('finance_budgets').update(payload).eq('id', id);
  if (data.categories !== undefined) {
    await supabase.from('finance_budget_categories').delete().eq('budget_id', id);
    for (const c of data.categories) {
      await supabase.from('finance_budget_categories').insert({
        budget_id: id,
        category: c.category,
        allocated_amount: c.allocated_amount,
        spent_amount: 0,
        notes: c.notes ?? null,
      });
    }
  }
  const { data: b } = await supabase.from('finance_budgets').select('year').eq('id', id).single();
  if (b?.year) return getBudgetByYear(b.year) as Promise<Budget & { categories: BudgetCategory[] }>;
  const { data: inv } = await supabase.from('finance_budgets').select('*').eq('id', id).single();
  const { data: cats } = await supabase.from('finance_budget_categories').select('*').eq('budget_id', id);
  return {
    ...mapDbBudget((inv ?? {}) as Record<string, unknown>),
    categories: (cats ?? []).map((c: Record<string, unknown>) => mapDbBudgetCategory(c)),
  };
}

function mapDbBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    year: Number(row.year),
    total_budget: Number(row.total_budget ?? 0),
    description: (row.description as string) ?? undefined,
    target_events_count: row.target_events_count != null ? Number(row.target_events_count) : undefined,
    target_revenue: row.target_revenue != null ? Number(row.target_revenue) : undefined,
    target_margin: row.target_margin != null ? Number(row.target_margin) : undefined,
    status: (row.status as Budget['status']) ?? 'active',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapDbBudgetCategory(row: Record<string, unknown>): BudgetCategory {
  return {
    id: row.id as string,
    budget_id: row.budget_id as string,
    category: row.category as string,
    allocated_amount: Number(row.allocated_amount ?? 0),
    spent_amount: Number(row.spent_amount ?? 0),
    percentage: row.percentage != null ? Number(row.percentage) : undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Event Budgets ---

function mapDbEventBudget(row: Record<string, unknown>): EventBudget {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    category: row.category as string,
    type: row.type as 'income' | 'expense',
    allocated_amount: Number(row.allocated_amount ?? 0),
    allocated_amount_low: row.allocated_amount_low != null ? Number(row.allocated_amount_low) : undefined,
    allocated_amount_high: row.allocated_amount_high != null ? Number(row.allocated_amount_high) : undefined,
    actual_amount: row.actual_amount != null ? Number(row.actual_amount) : undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getEventBudgets(eventId: string): Promise<EventBudget[]> {
  const { data, error } = await supabase
    .from('finance_event_budgets')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapDbEventBudget(r));
}

export async function createEventBudgets(
  lines: Array<{
    event_id: string;
    category: string;
    type: 'income' | 'expense';
    allocated_amount: number;
    notes?: string;
  }>
): Promise<void> {
  const orgId = getActiveOrgId();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { error } = await supabase.from('finance_event_budgets').insert({
      event_id: line.event_id,
      category: line.category,
      type: line.type,
      allocated_amount: line.allocated_amount,
      notes: line.notes ?? null,
      sort_order: i,
      org_id: orgId,
    });
    if (error) throw error;
  }
}

export async function deleteAllEventBudgets(eventId: string): Promise<void> {
  const { error } = await supabase.from('finance_event_budgets').delete().eq('event_id', eventId);
  if (error) throw error;
}

// --- Budget Projects ---

export async function getBudgetProjects(filters?: { status?: string; year?: number }): Promise<BudgetProject[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('finance_budget_projects').select('*');
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('created_at', { ascending: false });
  if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  let projects = (data ?? []).map((r: Record<string, unknown>) => mapDbBudgetProject(r));
  if (filters?.year) {
    projects = projects.filter((p) => {
      if (!p.start_date) return true;
      return new Date(p.start_date).getFullYear() === filters.year;
    });
  }
  return projects;
}

export async function getBudgetProject(projectId: string): Promise<BudgetProject | null> {
  const { data, error } = await supabase.from('finance_budget_projects').select('*').eq('id', projectId).single();
  if (error || !data) return null;
  return mapDbBudgetProject(data as Record<string, unknown>);
}

export async function getProjectBudgetLines(projectId: string): Promise<BudgetProjectLine[]> {
  const { data, error } = await supabase.from('finance_budget_project_lines').select('*').eq('project_id', projectId);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapDbBudgetProjectLine(r));
}

export async function createBudgetProject(
  input: Omit<BudgetProject, 'id' | 'created_at' | 'updated_at'>
): Promise<BudgetProject> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('finance_budget_projects')
    .insert({
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      status: input.status ?? 'draft',
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      responsible: input.responsible ?? null,
      notes: input.notes ?? null,
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbBudgetProject(data as Record<string, unknown>);
}

export async function createProjectBudgetLine(
  input: Omit<BudgetProjectLine, 'id' | 'created_at' | 'updated_at'>
): Promise<BudgetProjectLine> {
  const { data, error } = await supabase
    .from('finance_budget_project_lines')
    .insert({
      project_id: input.project_id,
      category: input.category,
      type: input.type,
      allocated_amount: input.allocated_amount,
      allocated_amount_low: input.allocated_amount_low ?? null,
      allocated_amount_high: input.allocated_amount_high ?? null,
      actual_amount: input.actual_amount ?? null,
      notes: input.notes ?? null,
      org_id: getActiveOrgId(),
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbBudgetProjectLine(data as Record<string, unknown>);
}

export async function updateBudgetProject(projectId: string, updates: Partial<BudgetProject>): Promise<BudgetProject> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(updates)) {
    if (['id', 'created_at'].includes(k)) continue;
    if (v !== undefined) payload[k] = v;
  }
  const { data, error } = await supabase.from('finance_budget_projects').update(payload).eq('id', projectId).select().single();
  if (error) throw error;
  return mapDbBudgetProject(data as Record<string, unknown>);
}

export async function deleteBudgetProject(projectId: string): Promise<void> {
  await supabase.from('finance_budget_project_lines').delete().eq('project_id', projectId);
  const { error } = await supabase.from('finance_budget_projects').delete().eq('id', projectId);
  if (error) throw error;
}

export async function deleteProjectBudgetLines(projectId: string): Promise<void> {
  const { error } = await supabase.from('finance_budget_project_lines').delete().eq('project_id', projectId);
  if (error) throw error;
}

function mapDbBudgetProject(row: Record<string, unknown>): BudgetProject {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    type: row.type as BudgetProject['type'],
    status: (row.status as BudgetProject['status']) ?? 'draft',
    start_date: (row.start_date as string) ?? undefined,
    end_date: (row.end_date as string) ?? undefined,
    responsible: (row.responsible as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapDbBudgetProjectLine(row: Record<string, unknown>): BudgetProjectLine {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    category: row.category as string,
    type: row.type as 'income' | 'expense',
    allocated_amount: Number(row.allocated_amount ?? 0),
    allocated_amount_low: row.allocated_amount_low != null ? Number(row.allocated_amount_low) : undefined,
    allocated_amount_high: row.allocated_amount_high != null ? Number(row.allocated_amount_high) : undefined,
    actual_amount: row.actual_amount != null ? Number(row.actual_amount) : undefined,
    notes: (row.notes as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Invoices ---

export async function getInvoices(filters?: {
  type?: string;
  status?: string;
  year?: number;
}): Promise<(Invoice & { invoice_lines: InvoiceLine[] })[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('finance_invoices').select('*');
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('issue_date', { ascending: false });
  if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
  if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters?.year != null) {
    const start = `${filters.year}-01-01`;
    const end = `${filters.year}-12-31`;
    query = query.gte('issue_date', start).lte('issue_date', end);
  }
  const { data: invoices, error: e1 } = await query;
  if (e1) throw e1;
  const { data: lines, error: e2 } = await supabase.from('finance_invoice_lines').select('*');
  if (e2) throw e2;
  const lineList = (lines ?? []) as Record<string, unknown>[];
  return (invoices ?? []).map((inv: Record<string, unknown>) => ({
    ...mapDbInvoice(inv),
    invoice_lines: lineList
      .filter((l) => l.invoice_id === inv.id)
      .sort((a, b) => Number(a.order_index ?? 0) - Number(b.order_index ?? 0))
      .map(mapDbInvoiceLine),
  }));
}

export async function getInvoiceById(id: string): Promise<(Invoice & { invoice_lines: InvoiceLine[] }) | null> {
  const { data: inv, error: e1 } = await supabase.from('finance_invoices').select('*').eq('id', id).single();
  if (e1 || !inv) return null;
  const { data: lines } = await supabase.from('finance_invoice_lines').select('*').eq('invoice_id', id).order('order_index');
  return {
    ...mapDbInvoice(inv as Record<string, unknown>),
    invoice_lines: (lines ?? []).map((l: Record<string, unknown>) => mapDbInvoiceLine(l)),
  };
}

export async function createInvoice(data: {
  invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>;
  lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[];
}): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
  const id = crypto.randomUUID();
  const invoice_number = generateUniqueCode(data.invoice.type === 'invoice' ? 'FAC' : 'DEV', id, 8);
  const { data: { user } } = await supabase.auth.getUser();

  const { error: e1 } = await supabase.from('finance_invoices').insert({
    id,
    invoice_number,
    type: data.invoice.type,
    issue_date: typeof data.invoice.issue_date === 'string' ? data.invoice.issue_date : (data.invoice.issue_date as Date).toISOString().slice(0, 10),
    due_date: data.invoice.due_date ?? null,
    status: data.invoice.status ?? 'pending',
    client_type: data.invoice.client_type ?? null,
    client_name: data.invoice.client_name,
    client_address: data.invoice.client_address ?? null,
    client_postal_code: data.invoice.client_postal_code ?? null,
    client_city: data.invoice.client_city ?? null,
    client_email: data.invoice.client_email ?? null,
    contact_id: data.invoice.contact_id ?? null,
    category: data.invoice.category ?? null,
    subtotal_excl_tax: data.invoice.subtotal_excl_tax,
    total_vat: data.invoice.total_vat,
    total_incl_tax: data.invoice.total_incl_tax,
    payment_terms: data.invoice.payment_terms ?? null,
    payment_method: data.invoice.payment_method ?? null,
    paid_date: data.invoice.paid_date ?? null,
    notes: data.invoice.notes ?? null,
    pdf_url: data.invoice.pdf_url ?? null,
    org_id: getActiveOrgId(),
    created_by: user?.id ?? null,
  });
  if (e1) throw e1;

  for (let i = 0; i < data.lines.length; i++) {
    const line = data.lines[i];
    const { error: e2 } = await supabase.from('finance_invoice_lines').insert({
      invoice_id: id,
      org_id: getActiveOrgId(),
      description: line.description,
      quantity: line.quantity ?? 1,
      unit_price_excl_tax: line.unit_price_excl_tax,
      vat_rate: line.vat_rate,
      amount_excl_tax: line.amount_excl_tax,
      amount_vat: line.amount_vat,
      amount_incl_tax: line.amount_incl_tax,
      order_index: i,
    });
    if (e2) throw e2;
  }

  const result = await getInvoiceById(id);
  if (!result) throw new Error('Failed to fetch created invoice');
  return result;
}

export async function updateInvoice(
  id: string,
  updates: { invoice?: Partial<Invoice>; lines?: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }
): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
  if (updates.invoice) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [k, v] of Object.entries(updates.invoice)) {
      if (['id', 'created_at', 'invoice_number'].includes(k)) continue;
      if (v !== undefined) payload[k] = v;
    }
    await supabase.from('finance_invoices').update(payload).eq('id', id);
  }
  if (updates.lines) {
    await supabase.from('finance_invoice_lines').delete().eq('invoice_id', id);
    for (let i = 0; i < updates.lines.length; i++) {
      const line = updates.lines[i];
      await supabase.from('finance_invoice_lines').insert({
        invoice_id: id,
        description: line.description,
        quantity: line.quantity ?? 1,
        unit_price_excl_tax: line.unit_price_excl_tax,
        vat_rate: line.vat_rate,
        amount_excl_tax: line.amount_excl_tax,
        amount_vat: line.amount_vat,
        amount_incl_tax: line.amount_incl_tax,
        order_index: i,
      });
    }
  }
  const result = await getInvoiceById(id);
  if (!result) throw new Error('Invoice not found');
  return result;
}

export async function deleteInvoice(id: string): Promise<void> {
  await supabase.from('finance_invoice_lines').delete().eq('invoice_id', id);
  const { error } = await supabase.from('finance_invoices').delete().eq('id', id);
  if (error) throw error;
}

export async function markInvoiceAsPaid(
  id: string,
  paidDate?: string
): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
  const date = paidDate ?? new Date().toISOString().slice(0, 10);
  return updateInvoice(id, { invoice: { status: 'paid', paid_date: date } });
}

function mapDbInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    invoice_number: row.invoice_number as string,
    type: row.type as 'invoice' | 'quote',
    issue_date: row.issue_date as string,
    due_date: (row.due_date as string) ?? undefined,
    status: row.status as Invoice['status'],
    client_type: (row.client_type as Invoice['client_type']) ?? undefined,
    client_name: row.client_name as string,
    client_address: (row.client_address as string) ?? undefined,
    client_postal_code: (row.client_postal_code as string) ?? undefined,
    client_city: (row.client_city as string) ?? undefined,
    client_email: (row.client_email as string) ?? undefined,
    contact_id: (row.contact_id as string) ?? undefined,
    category: (row.category as string) ?? undefined,
    subtotal_excl_tax: Number(row.subtotal_excl_tax ?? 0),
    total_vat: Number(row.total_vat ?? 0),
    total_incl_tax: Number(row.total_incl_tax ?? 0),
    payment_terms: (row.payment_terms as string) ?? undefined,
    payment_method: (row.payment_method as string) ?? undefined,
    paid_date: (row.paid_date as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    pdf_url: (row.pdf_url as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapDbInvoiceLine(row: Record<string, unknown>): InvoiceLine {
  return {
    id: row.id as string,
    invoice_id: row.invoice_id as string,
    description: row.description as string,
    quantity: Number(row.quantity ?? 1),
    unit_price_excl_tax: Number(row.unit_price_excl_tax ?? 0),
    vat_rate: Number(row.vat_rate ?? 0),
    amount_excl_tax: Number(row.amount_excl_tax ?? 0),
    amount_vat: Number(row.amount_vat ?? 0),
    amount_incl_tax: Number(row.amount_incl_tax ?? 0),
    order_index: Number(row.order_index ?? 0),
    created_at: row.created_at as string,
  };
}

// --- Treasury Forecasts ---

export async function getTreasuryForecasts(): Promise<TreasuryForecast[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('finance_treasury_forecasts').select('*');
  if (orgId) query = query.eq('org_id', orgId);
  const { data, error } = await query.order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => mapDbTreasuryForecast(r));
}

export async function createTreasuryForecast(
  input: Omit<TreasuryForecast, 'id' | 'created_at' | 'updated_at'>
): Promise<TreasuryForecast> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('finance_treasury_forecasts')
    .insert({
      date: typeof input.date === 'string' ? input.date : (input.date as Date).toISOString().slice(0, 10),
      type: input.type,
      label: input.label,
      amount: input.amount,
      category: input.category,
      certainty_level: input.certainty_level,
      bank_account_id: input.bank_account_id ?? null,
      notes: input.notes ?? null,
      realized: input.realized ?? false,
      transaction_id: input.transaction_id ?? null,
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapDbTreasuryForecast(data as Record<string, unknown>);
}

export async function updateTreasuryForecast(id: string, updates: Partial<TreasuryForecast>): Promise<TreasuryForecast> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(updates)) {
    if (['id', 'created_at'].includes(k)) continue;
    if (v !== undefined) payload[k] = v;
  }
  const { data, error } = await supabase.from('finance_treasury_forecasts').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return mapDbTreasuryForecast(data as Record<string, unknown>);
}

export async function deleteTreasuryForecast(id: string): Promise<void> {
  const { error } = await supabase.from('finance_treasury_forecasts').delete().eq('id', id);
  if (error) throw error;
}

function mapDbTreasuryForecast(row: Record<string, unknown>): TreasuryForecast {
  return {
    id: row.id as string,
    date: row.date as string,
    type: row.type as 'income' | 'expense',
    label: row.label as string,
    amount: Number(row.amount),
    category: row.category as string,
    certainty_level: row.certainty_level as TreasuryForecast['certainty_level'],
    bank_account_id: (row.bank_account_id as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    realized: Boolean(row.realized ?? false),
    transaction_id: (row.transaction_id as string) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Budget Templates ---

export async function getAllBudgetTemplatesWithLines(): Promise<BudgetTemplateWithLines[]> {
  const orgId = getActiveOrgId();
  let tQuery = supabase.from('finance_budget_templates').select('*');
  if (orgId) tQuery = tQuery.eq('org_id', orgId);
  const { data: templates, error: e1 } = await tQuery;
  if (e1) throw e1;
  const { data: lines, error: e2 } = await supabase.from('finance_budget_template_lines').select('*');
  if (e2) throw e2;
  const lineList = (lines ?? []) as Record<string, unknown>[];
  return (templates ?? []).map((t: Record<string, unknown>) => ({
    ...mapDbBudgetTemplate(t),
    lines: lineList
      .filter((l) => l.template_id === t.id)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      .map(mapDbBudgetTemplateLine),
  }));
}

export async function createBudgetTemplate(data: {
  name: string;
  description?: string;
  icon?: string;
  is_default?: boolean;
  lines?: { category: string; type: 'income' | 'expense'; allocated_amount: number; sort_order?: number }[];
}): Promise<BudgetTemplateWithLines> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: inserted, error: e1 } = await supabase
    .from('finance_budget_templates')
    .insert({
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      is_default: data.is_default ?? false,
      org_id: getActiveOrgId(),
      created_by: user?.id ?? null,
    })
    .select()
    .single();
  if (e1) throw e1;
  const t = inserted as Record<string, unknown>;
  const templateId = t.id as string;
  const newLines: BudgetTemplateLine[] = [];
  for (const l of data.lines ?? []) {
    const { data: line } = await supabase
      .from('finance_budget_template_lines')
      .insert({
        template_id: templateId,
        category: l.category,
        type: l.type,
        allocated_amount: l.allocated_amount,
        sort_order: l.sort_order ?? 0,
        org_id: getActiveOrgId(),
      })
      .select()
      .single();
    if (line) newLines.push(mapDbBudgetTemplateLine(line as Record<string, unknown>));
  }
  return { ...mapDbBudgetTemplate(t), lines: newLines };
}

export async function updateBudgetTemplate(
  id: string,
  data: { name?: string; description?: string; icon?: string; is_default?: boolean; lines?: { category: string; type: 'income' | 'expense'; allocated_amount: number; sort_order?: number }[] }
): Promise<BudgetTemplateWithLines> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.icon !== undefined) payload.icon = data.icon;
  if (data.is_default !== undefined) payload.is_default = data.is_default;
  await supabase.from('finance_budget_templates').update(payload).eq('id', id);
  if (data.lines !== undefined) {
    await supabase.from('finance_budget_template_lines').delete().eq('template_id', id);
    for (const l of data.lines) {
      await supabase.from('finance_budget_template_lines').insert({
        template_id: id,
        category: l.category,
        type: l.type,
        allocated_amount: l.allocated_amount,
        sort_order: l.sort_order ?? 0,
      });
    }
  }
  const all = await getAllBudgetTemplatesWithLines();
  const found = all.find((x) => x.id === id);
  if (!found) throw new Error('Template not found');
  return found;
}

export async function deleteBudgetTemplate(id: string): Promise<void> {
  await supabase.from('finance_budget_template_lines').delete().eq('template_id', id);
  const { error } = await supabase.from('finance_budget_templates').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateBudgetTemplate(id: string, newName?: string): Promise<BudgetTemplateWithLines> {
  const all = await getAllBudgetTemplatesWithLines();
  const orig = all.find((x) => x.id === id);
  if (!orig) throw new Error('Template not found');
  const name = newName ?? `${orig.name} (copie)`;
  return createBudgetTemplate({
    name,
    description: orig.description,
    icon: orig.icon,
    is_default: false,
    lines: orig.lines.map((l) => ({ category: l.category, type: l.type, allocated_amount: l.allocated_amount, sort_order: l.sort_order })),
  });
}

function mapDbBudgetTemplate(row: Record<string, unknown>): BudgetTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? undefined,
    icon: (row.icon as string) ?? undefined,
    is_default: Boolean(row.is_default ?? false),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapDbBudgetTemplateLine(row: Record<string, unknown>): BudgetTemplateLine {
  return {
    id: row.id as string,
    template_id: row.template_id as string,
    category: row.category as string,
    type: row.type as 'income' | 'expense',
    allocated_amount: Number(row.allocated_amount ?? 0),
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at as string,
  };
}

// --- KPIs & Stats ---

export async function getFinanceKPIs(year?: number): Promise<FinanceKPIs> {
  const transactions = await getTransactions(year);
  const accounts = await getBankAccounts();
  const currentBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = year ?? new Date().getFullYear();

  const monthlyRevenue = transactions
    .filter((t) => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    currentBalance,
    monthlyRevenue,
    monthlyExpense,
    subsidy: 0,
    membership: 0,
    remainingBudget: 0,
    trends: { revenue: [], expense: [], balance: [] },
  };
}

export async function getProfitAndLoss(
  periodType?: 'month' | 'quarter' | 'semester' | 'year',
  year?: number,
  month?: number
): Promise<ProfitAndLoss> {
  const y = year ?? new Date().getFullYear();
  const m = month ?? new Date().getMonth() + 1;
  const periodLabel =
    periodType === 'year'
      ? `Année ${y}`
      : periodType === 'month'
        ? new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : periodType === 'quarter'
          ? `T${Math.floor((m - 1) / 3) + 1} ${y}`
          : periodType === 'semester'
            ? `S${m <= 6 ? 1 : 2} ${y}`
            : `${y}`;

  const transactions = await getTransactions(y);
  const revenue: ProfitAndLoss['revenue'] = {
    billetterie: 0,
    bar: 0,
    merchandising: 0,
    subventions: 0,
    adhesions: 0,
    autres: 0,
    total: 0,
  };
  const expenses: ProfitAndLoss['expenses'] = {
    cachets: 0,
    location: 0,
    technique: 0,
    communication: 0,
    salaires: 0,
    charges: 0,
    autres: 0,
    total: 0,
  };

  const revenueCatMap: Record<string, keyof typeof revenue> = {
    Billetterie: 'billetterie',
    Bar: 'bar',
    Merchandising: 'merchandising',
    Subventions: 'subventions',
    Adhésions: 'adhesions',
  };
  const expenseCatMap: Record<string, keyof typeof expenses> = {
    'Cachets artistes': 'cachets',
    Location: 'location',
    Technique: 'technique',
    Communication: 'communication',
  };

  for (const t of transactions) {
    if (t.type === 'income') {
      const k = revenueCatMap[t.category] ?? 'autres';
      if (k in revenue && k !== 'total') (revenue as Record<string, number>)[k] += t.amount;
      revenue.total += t.amount;
    } else {
      const k = expenseCatMap[t.category] ?? 'autres';
      if (k in expenses && k !== 'total') (expenses as Record<string, number>)[k] += t.amount;
      expenses.total += t.amount;
    }
  }

  return {
    period: periodLabel,
    revenue,
    expenses,
    grossMargin: revenue.total - expenses.total,
    operatingResult: revenue.total - expenses.total,
  };
}

export async function getBalanceSheet(
  periodType?: 'month' | 'quarter' | 'semester' | 'year',
  year?: number
): Promise<BalanceSheet> {
  const y = year ?? new Date().getFullYear();
  const periodLabel = periodType === 'year' ? `Année ${y}` : `${y}`;
  const accounts = await getBankAccounts();
  const cash = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const invoices = await getInvoices({ year: y });
  const receivables = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total_incl_tax, 0);

  return {
    period: periodLabel,
    assets: {
      cash,
      receivables,
      inventory: 0,
      equipment: 0,
      total: cash + receivables,
    },
    liabilities: {
      payables: 0,
      loans: 0,
      provisions: 0,
      equity: cash + receivables,
      total: cash + receivables,
    },
  };
}

export async function getFinancialRatios(
  _periodType?: 'month' | 'quarter' | 'semester' | 'year',
  _year?: number
): Promise<FinancialRatios> {
  return {
    liquidityRatio: 0,
    autonomyRatio: 0,
    roi: 0,
    marginRate: 0,
  };
}

export async function getPendingInvoicesCount(): Promise<number> {
  const invoices = await getInvoices({ status: 'pending' });
  return invoices.length;
}
