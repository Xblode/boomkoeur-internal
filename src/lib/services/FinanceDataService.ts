/**
 * FinanceDataService - Couche d'abstraction pour les données financières
 *
 * Cette interface permet de basculer facilement entre localStorage et Supabase
 * en changeant uniquement l'implémentation, sans modifier les composants.
 */

import type {
  BankAccount,
  Transaction,
  TransactionCategory,
  Budget,
  BudgetCategory,
  BudgetProject,
  BudgetProjectLine,
  Invoice,
  InvoiceLine,
  FinanceKPIs,
  ProfitAndLoss,
  BalanceSheet,
  FinancialRatios,
} from '@/types/finance';

import * as FinanceSupabase from '@/lib/supabase/finance';
import * as BankAccountsLS from '@/lib/localStorage/finance/bankAccounts';
import * as TransactionsLS from '@/lib/localStorage/finance/transactions';
import * as BudgetsLS from '@/lib/localStorage/finance/budgets';
import * as InvoicesLS from '@/lib/localStorage/finance/invoices';

/**
 * Interface du service de données financières
 * Implémentable par localStorage ou Supabase
 */
export interface IFinanceDataService {
  // Bank Accounts
  getBankAccounts(): Promise<BankAccount[]>
  getBankAccountById(id: string): Promise<BankAccount | null>
  createBankAccount(data: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount>
  updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount>
  deleteBankAccount(id: string): Promise<void>

  // Transactions
  getTransactions(year?: number): Promise<Transaction[]>
  getTransactionById(id: string): Promise<Transaction | null>
  createTransaction(data: Omit<Transaction, 'id' | 'entry_number' | 'created_at' | 'updated_at'>): Promise<Transaction>
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>
  validateTransaction(id: string, userId: string): Promise<Transaction>
  reconcileTransaction(id: string): Promise<Transaction>

  // Transaction Categories
  getTransactionCategories(type?: 'income' | 'expense'): Promise<TransactionCategory[]>
  createTransactionCategory(data: Omit<TransactionCategory, 'id' | 'created_at' | 'updated_at'>): Promise<TransactionCategory>
  updateTransactionCategory(id: string, updates: Partial<TransactionCategory>): Promise<TransactionCategory>
  deleteTransactionCategory(id: string): Promise<TransactionCategory>

  // Budgets
  getBudgets(): Promise<(Budget & { categories: BudgetCategory[] })[]>
  getBudgetByYear(year: number): Promise<(Budget & { categories: BudgetCategory[] }) | null>
  createBudget(data: { budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>; categories: Omit<BudgetCategory, 'id' | 'budget_id' | 'created_at' | 'updated_at'>[] }): Promise<Budget & { categories: BudgetCategory[] }>
  updateBudget(id: string, data: { total_budget?: number; description?: string; target_events_count?: number; target_revenue?: number; target_margin?: number; categories?: { category: string; allocated_amount: number; notes?: string }[] }): Promise<Budget & { categories: BudgetCategory[] }>

  // Budget Projects
  getBudgetProjects(filters?: { status?: string; year?: number }): Promise<BudgetProject[]>
  getBudgetProject(projectId: string): Promise<BudgetProject | null>
  getProjectBudgetLines(projectId: string): Promise<BudgetProjectLine[]>
  createBudgetProject(data: Omit<BudgetProject, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetProject>
  createProjectBudgetLine(data: Omit<BudgetProjectLine, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetProjectLine>
  updateBudgetProject(projectId: string, updates: Partial<BudgetProject>): Promise<BudgetProject>
  deleteBudgetProject(projectId: string): Promise<void>
  deleteProjectBudgetLines(projectId: string): Promise<void>

  // Invoices
  getInvoices(filters?: { type?: string; status?: string; year?: number }): Promise<(Invoice & { invoice_lines: InvoiceLine[] })[]>
  getInvoiceById(id: string): Promise<(Invoice & { invoice_lines: InvoiceLine[] }) | null>
  createInvoice(data: { invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>; lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }): Promise<Invoice & { invoice_lines: InvoiceLine[] }>
  updateInvoice(id: string, updates: { invoice?: Partial<Invoice>; lines?: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }): Promise<Invoice & { invoice_lines: InvoiceLine[] }>
  deleteInvoice(id: string): Promise<void>
  markInvoiceAsPaid(id: string, paidDate?: string): Promise<Invoice & { invoice_lines: InvoiceLine[] }>

  // KPIs & Stats
  getFinanceKPIs(year?: number): Promise<FinanceKPIs>
  getProfitAndLoss(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number, month?: number): Promise<ProfitAndLoss>
  getBalanceSheet(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number): Promise<BalanceSheet>
  getFinancialRatios(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number): Promise<FinancialRatios>
  getPendingInvoicesCount(): Promise<number>
}

/**
 * Implémentation localStorage du service
 */
class LocalStorageFinanceService implements IFinanceDataService {
  // Bank Accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    return BankAccountsLS.getBankAccounts()
  }

  async getBankAccountById(id: string): Promise<BankAccount | null> {
    return BankAccountsLS.getBankAccountById(id)
  }

  async createBankAccount(data: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
    return BankAccountsLS.createBankAccount(data)
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    return BankAccountsLS.updateBankAccount(id, updates)
  }

  async deleteBankAccount(id: string): Promise<void> {
    return BankAccountsLS.deleteBankAccount(id)
  }

  // Transactions
  async getTransactions(year?: number): Promise<Transaction[]> {
    return TransactionsLS.getTransactions(year)
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return TransactionsLS.getTransactionById(id)
  }

  async createTransaction(data: Omit<Transaction, 'id' | 'entry_number' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    return TransactionsLS.createTransaction(data)
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return TransactionsLS.updateTransaction(id, updates)
  }

  async deleteTransaction(id: string): Promise<void> {
    return TransactionsLS.deleteTransaction(id)
  }

  async validateTransaction(id: string, userId: string): Promise<Transaction> {
    return TransactionsLS.validateTransaction(id, userId)
  }

  async reconcileTransaction(id: string): Promise<Transaction> {
    return TransactionsLS.reconcileTransaction(id)
  }

  // Transaction Categories
  async getTransactionCategories(type?: 'income' | 'expense'): Promise<TransactionCategory[]> {
    return TransactionsLS.getTransactionCategories(type)
  }

  async createTransactionCategory(data: Omit<TransactionCategory, 'id' | 'created_at' | 'updated_at'>): Promise<TransactionCategory> {
    return TransactionsLS.createTransactionCategory(data)
  }

  async updateTransactionCategory(id: string, updates: Partial<TransactionCategory>): Promise<TransactionCategory> {
    return TransactionsLS.updateTransactionCategory(id, updates)
  }

  async deleteTransactionCategory(id: string): Promise<TransactionCategory> {
    return TransactionsLS.deleteTransactionCategory(id)
  }

  // Budgets
  async getBudgets(): Promise<(Budget & { categories: BudgetCategory[] })[]> {
    return BudgetsLS.getBudgets()
  }

  async getBudgetByYear(year: number): Promise<(Budget & { categories: BudgetCategory[] }) | null> {
    return BudgetsLS.getBudgetByYear(year)
  }

  async createBudget(data: { budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>; categories: Omit<BudgetCategory, 'id' | 'budget_id' | 'created_at' | 'updated_at'>[] }): Promise<Budget & { categories: BudgetCategory[] }> {
    return BudgetsLS.createBudget(data)
  }

  async updateBudget(id: string, data: { total_budget?: number; description?: string; target_events_count?: number; target_revenue?: number; target_margin?: number; categories?: { category: string; allocated_amount: number; notes?: string }[] }): Promise<Budget & { categories: BudgetCategory[] }> {
    return BudgetsLS.updateBudget(id, data)
  }

  // Budget Projects
  async getBudgetProjects(filters?: { status?: string; year?: number }): Promise<BudgetProject[]> {
    return BudgetsLS.getBudgetProjects(filters)
  }

  async getBudgetProject(projectId: string): Promise<BudgetProject | null> {
    return BudgetsLS.getBudgetProject(projectId)
  }

  async getProjectBudgetLines(projectId: string): Promise<BudgetProjectLine[]> {
    return BudgetsLS.getProjectBudgetLines(projectId)
  }

  async createBudgetProject(data: Omit<BudgetProject, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetProject> {
    return BudgetsLS.createBudgetProject(data)
  }

  async createProjectBudgetLine(data: Omit<BudgetProjectLine, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetProjectLine> {
    return BudgetsLS.createProjectBudgetLine(data)
  }

  async updateBudgetProject(projectId: string, updates: Partial<BudgetProject>): Promise<BudgetProject> {
    return BudgetsLS.updateBudgetProject(projectId, updates)
  }

  async deleteBudgetProject(projectId: string): Promise<void> {
    return BudgetsLS.deleteBudgetProject(projectId)
  }

  async deleteProjectBudgetLines(projectId: string): Promise<void> {
    return BudgetsLS.deleteProjectBudgetLines(projectId)
  }

  // Invoices
  async getInvoices(filters?: { type?: string; status?: string; year?: number }): Promise<(Invoice & { invoice_lines: InvoiceLine[] })[]> {
    return InvoicesLS.getInvoices(filters)
  }

  async getInvoiceById(id: string): Promise<(Invoice & { invoice_lines: InvoiceLine[] }) | null> {
    return InvoicesLS.getInvoiceById(id)
  }

  async createInvoice(data: { invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>; lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
    return InvoicesLS.createInvoice(data)
  }

  async updateInvoice(id: string, updates: { invoice?: Partial<Invoice>; lines?: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
    return InvoicesLS.updateInvoice(id, updates)
  }

  async deleteInvoice(id: string): Promise<void> {
    return InvoicesLS.deleteInvoice(id)
  }

  async markInvoiceAsPaid(id: string, paidDate?: string): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
    return InvoicesLS.markInvoiceAsPaid(id, paidDate)
  }

  // KPIs & Stats (Simplified implementations)
  async getFinanceKPIs(year?: number): Promise<FinanceKPIs> {
    const transactions = await this.getTransactions(year)
    const accounts = await this.getBankAccounts()
    
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0)
    const currentMonth = new Date().getMonth()
    
    const monthlyRevenue = transactions
      .filter((t) => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      currentBalance,
      monthlyRevenue,
      monthlyExpense,
      subsidy: 0,
      membership: 0,
      remainingBudget: 0,
      trends: {
        revenue: [],
        expense: [],
        balance: [],
      },
    }
  }

  async getProfitAndLoss(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number, month?: number): Promise<ProfitAndLoss> {
    const y = year ?? new Date().getFullYear()
    const m = month ?? new Date().getMonth() + 1
    const periodLabel = periodType === 'year' ? `Année ${y}` : periodType === 'month'
      ? new Date(y, m - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      : periodType === 'quarter'
        ? `T${Math.floor((m - 1) / 3) + 1} ${y}`
        : periodType === 'semester'
          ? `S${m <= 6 ? 1 : 2} ${y}`
          : `${y}`
    return {
      period: periodLabel,
      revenue: {
        billetterie: 0,
        bar: 0,
        merchandising: 0,
        subventions: 0,
        adhesions: 0,
        autres: 0,
        total: 0,
      },
      expenses: {
        cachets: 0,
        location: 0,
        technique: 0,
        communication: 0,
        salaires: 0,
        charges: 0,
        autres: 0,
        total: 0,
      },
      grossMargin: 0,
      operatingResult: 0,
    }
  }

  async getBalanceSheet(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number): Promise<BalanceSheet> {
    const y = year ?? new Date().getFullYear()
    const periodLabel = periodType === 'year' ? `Année ${y}` : `${y}`
    return {
      period: periodLabel,
      assets: {
        cash: 0,
        receivables: 0,
        inventory: 0,
        equipment: 0,
        total: 0,
      },
      liabilities: {
        payables: 0,
        loans: 0,
        provisions: 0,
        equity: 0,
        total: 0,
      },
    }
  }

  async getFinancialRatios(_periodType?: 'month' | 'quarter' | 'semester' | 'year', _year?: number): Promise<FinancialRatios> {
    return {
      liquidityRatio: 0,
      autonomyRatio: 0,
      roi: 0,
      marginRate: 0,
    }
  }

  async getPendingInvoicesCount(): Promise<number> {
    const invoices = await this.getInvoices({ status: 'pending' })
    return invoices.length
  }
}

/**
 * Implémentation Supabase du service
 */
class SupabaseFinanceService implements IFinanceDataService {
  async getBankAccounts(): Promise<BankAccount[]> {
    return FinanceSupabase.getBankAccounts();
  }
  async getBankAccountById(id: string): Promise<BankAccount | null> {
    return FinanceSupabase.getBankAccountById(id);
  }
  async createBankAccount(data: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
    return FinanceSupabase.createBankAccount(data);
  }
  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    return FinanceSupabase.updateBankAccount(id, updates);
  }
  async deleteBankAccount(id: string): Promise<void> {
    return FinanceSupabase.deleteBankAccount(id);
  }

  async getTransactions(year?: number): Promise<Transaction[]> {
    return FinanceSupabase.getTransactions(year);
  }
  async getTransactionById(id: string): Promise<Transaction | null> {
    return FinanceSupabase.getTransactionById(id);
  }
  async createTransaction(data: Omit<Transaction, 'id' | 'entry_number' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    return FinanceSupabase.createTransaction(data);
  }
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return FinanceSupabase.updateTransaction(id, updates);
  }
  async deleteTransaction(id: string): Promise<void> {
    return FinanceSupabase.deleteTransaction(id);
  }
  async validateTransaction(id: string, userId: string): Promise<Transaction> {
    return FinanceSupabase.validateTransaction(id, userId);
  }
  async reconcileTransaction(id: string): Promise<Transaction> {
    return FinanceSupabase.reconcileTransaction(id);
  }

  async getTransactionCategories(type?: 'income' | 'expense'): Promise<TransactionCategory[]> {
    return FinanceSupabase.getTransactionCategories(type);
  }
  async createTransactionCategory(data: Omit<TransactionCategory, 'id' | 'created_at' | 'updated_at'>): Promise<TransactionCategory> {
    return FinanceSupabase.createTransactionCategory(data);
  }
  async updateTransactionCategory(id: string, updates: Partial<TransactionCategory>): Promise<TransactionCategory> {
    return FinanceSupabase.updateTransactionCategory(id, updates);
  }
  async deleteTransactionCategory(id: string): Promise<TransactionCategory> {
    return FinanceSupabase.deleteTransactionCategory(id);
  }

  async getBudgets(): Promise<(Budget & { categories: BudgetCategory[] })[]> {
    return FinanceSupabase.getBudgets();
  }
  async getBudgetByYear(year: number): Promise<(Budget & { categories: BudgetCategory[] }) | null> {
    return FinanceSupabase.getBudgetByYear(year);
  }
  async createBudget(data: { budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>; categories: Omit<BudgetCategory, 'id' | 'budget_id' | 'created_at' | 'updated_at'>[] }): Promise<Budget & { categories: BudgetCategory[] }> {
    return FinanceSupabase.createBudget(data);
  }
  async updateBudget(id: string, data: { total_budget?: number; description?: string; target_events_count?: number; target_revenue?: number; target_margin?: number; categories?: { category: string; allocated_amount: number; notes?: string }[] }): Promise<Budget & { categories: BudgetCategory[] }> {
    return FinanceSupabase.updateBudget(id, data);
  }

  async getBudgetProjects(filters?: { status?: string; year?: number }): Promise<BudgetProject[]> {
    return FinanceSupabase.getBudgetProjects(filters);
  }
  async getBudgetProject(projectId: string): Promise<BudgetProject | null> {
    return FinanceSupabase.getBudgetProject(projectId);
  }
  async getProjectBudgetLines(projectId: string): Promise<BudgetProjectLine[]> {
    return FinanceSupabase.getProjectBudgetLines(projectId);
  }
  async createBudgetProject(data: Omit<BudgetProject, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetProject> {
    return FinanceSupabase.createBudgetProject(data);
  }
  async createProjectBudgetLine(data: Omit<BudgetProjectLine, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetProjectLine> {
    return FinanceSupabase.createProjectBudgetLine(data);
  }
  async updateBudgetProject(projectId: string, updates: Partial<BudgetProject>): Promise<BudgetProject> {
    return FinanceSupabase.updateBudgetProject(projectId, updates);
  }
  async deleteBudgetProject(projectId: string): Promise<void> {
    return FinanceSupabase.deleteBudgetProject(projectId);
  }
  async deleteProjectBudgetLines(projectId: string): Promise<void> {
    return FinanceSupabase.deleteProjectBudgetLines(projectId);
  }

  async getInvoices(filters?: { type?: string; status?: string; year?: number }): Promise<(Invoice & { invoice_lines: InvoiceLine[] })[]> {
    return FinanceSupabase.getInvoices(filters);
  }
  async getInvoiceById(id: string): Promise<(Invoice & { invoice_lines: InvoiceLine[] }) | null> {
    return FinanceSupabase.getInvoiceById(id);
  }
  async createInvoice(data: { invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>; lines: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
    return FinanceSupabase.createInvoice(data);
  }
  async updateInvoice(id: string, updates: { invoice?: Partial<Invoice>; lines?: Omit<InvoiceLine, 'id' | 'invoice_id' | 'created_at'>[] }): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
    return FinanceSupabase.updateInvoice(id, updates);
  }
  async deleteInvoice(id: string): Promise<void> {
    return FinanceSupabase.deleteInvoice(id);
  }
  async markInvoiceAsPaid(id: string, paidDate?: string): Promise<Invoice & { invoice_lines: InvoiceLine[] }> {
    return FinanceSupabase.markInvoiceAsPaid(id, paidDate);
  }

  async getFinanceKPIs(year?: number): Promise<FinanceKPIs> {
    return FinanceSupabase.getFinanceKPIs(year);
  }
  async getProfitAndLoss(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number, month?: number): Promise<ProfitAndLoss> {
    return FinanceSupabase.getProfitAndLoss(periodType, year, month);
  }
  async getBalanceSheet(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number): Promise<BalanceSheet> {
    return FinanceSupabase.getBalanceSheet(periodType, year);
  }
  async getFinancialRatios(periodType?: 'month' | 'quarter' | 'semester' | 'year', year?: number): Promise<FinancialRatios> {
    return FinanceSupabase.getFinancialRatios(periodType, year);
  }
  async getPendingInvoicesCount(): Promise<number> {
    return FinanceSupabase.getPendingInvoicesCount();
  }
}

/**
 * Instance singleton du service - Supabase
 */
export const financeDataService: IFinanceDataService = new SupabaseFinanceService();
