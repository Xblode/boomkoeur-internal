/**
 * Données de démonstration pour le module Finance
 * Initialise localStorage avec des données réalistes pour tester le module
 */

import type { BankAccount, Transaction, Budget, BudgetCategory, Invoice, InvoiceLine, BudgetProject } from '@/types/finance'
import { saveToStorage } from '@/lib/localStorage/finance/storage'

export const DEMO_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    name: 'Compte courant principal',
    bank_name: 'Banque Démo',
    account_type: 'checking',
    iban: 'FR76 1234 5678 9012 3456 7890 123',
    bic: 'BDEMOFRPP',
    initial_balance: 50000,
    current_balance: 75430.50,
    opening_date: '2025-01-01',
    is_active: true,
    notes: 'Compte principal de l\'association',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2026-01-29T10:00:00Z',
  },
  {
    id: 'bank-2',
    name: 'Livret A',
    bank_name: 'Banque Démo',
    account_type: 'savings',
    initial_balance: 20000,
    current_balance: 22500,
    opening_date: '2025-01-01',
    is_active: true,
    notes: 'Épargne de précaution',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
]

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'trans-1',
    entry_number: 'TRA-DHJHBNMT',
    fiscal_year: 2026,
    date: '2026-01-15',
    label: 'Vente de billets - Concert Rock',
    amount: 15000,
    type: 'income',
    category: 'Billetterie',
    bank_account_id: 'bank-1',
    payment_method: 'CB',
    vat_applicable: true,
    vat_rate: 20,
    amount_excl_tax: 12500,
    credit: 15000,
    debit: 0,
    status: 'validated',
    validated_at: '2026-01-16T10:00:00Z',
    validated_by: 'user-1',
    notes: 'Billetterie en ligne',
    reconciled: true,
    reconciliation_date: '2026-01-20T10:00:00Z',
    created_at: '2026-01-15T14:30:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'trans-2',
    entry_number: 'TRA-DHJHBNMU',
    fiscal_year: 2026,
    date: '2026-01-18',
    label: 'Cachet artiste - DJ Martin',
    amount: 2500,
    type: 'expense',
    category: 'Cachets artistes',
    bank_account_id: 'bank-1',
    payment_method: 'Virement',
    vat_applicable: false,
    debit: 2500,
    credit: 0,
    status: 'validated',
    validated_at: '2026-01-18T15:00:00Z',
    validated_by: 'user-1',
    reconciled: true,
    reconciliation_date: '2026-01-22T10:00:00Z',
    created_at: '2026-01-18T15:00:00Z',
    updated_at: '2026-01-22T10:00:00Z',
  },
  {
    id: 'trans-3',
    entry_number: 'TRA-DHJHBNMV',
    fiscal_year: 2026,
    date: '2026-01-20',
    label: 'Recettes bar - Soirée du 19/01',
    amount: 3200,
    type: 'income',
    category: 'Bar',
    bank_account_id: 'bank-1',
    payment_method: 'Espèces',
    vat_applicable: true,
    vat_rate: 20,
    amount_excl_tax: 2666.67,
    credit: 3200,
    debit: 0,
    status: 'validated',
    validated_at: '2026-01-21T09:00:00Z',
    validated_by: 'user-1',
    reconciled: false,
    created_at: '2026-01-20T22:30:00Z',
    updated_at: '2026-01-21T09:00:00Z',
  },
  {
    id: 'trans-4',
    entry_number: 'TRA-DHJHBNMW',
    fiscal_year: 2026,
    date: '2026-01-22',
    label: 'Location salle - Festival Printemps',
    amount: 5000,
    type: 'expense',
    category: 'Location',
    bank_account_id: 'bank-1',
    payment_method: 'Chèque',
    vat_applicable: true,
    vat_rate: 20,
    amount_excl_tax: 4166.67,
    debit: 5000,
    credit: 0,
    status: 'pending',
    notes: 'Acompte de 50% - Solde à régler en mars',
    reconciled: false,
    created_at: '2026-01-22T11:00:00Z',
    updated_at: '2026-01-22T11:00:00Z',
  },
  {
    id: 'trans-5',
    entry_number: 'TRA-DHJHBNMX',
    fiscal_year: 2026,
    date: '2026-01-25',
    label: 'Vente merchandising',
    amount: 1850,
    type: 'income',
    category: 'Merchandising',
    bank_account_id: 'bank-1',
    payment_method: 'CB',
    vat_applicable: true,
    vat_rate: 20,
    amount_excl_tax: 1541.67,
    credit: 1850,
    debit: 0,
    status: 'validated',
    validated_at: '2026-01-26T10:00:00Z',
    validated_by: 'user-1',
    reconciled: true,
    reconciliation_date: '2026-01-27T10:00:00Z',
    created_at: '2026-01-25T16:45:00Z',
    updated_at: '2026-01-27T10:00:00Z',
  },
]

export const DEMO_BUDGETS: (Budget & { categories: BudgetCategory[] })[] = [
  {
    id: 'budget-2026',
    year: 2026,
    total_budget: 250000,
    description: 'Budget annuel 2026',
    target_events_count: 12,
    target_revenue: 280000,
    target_margin: 30000,
    status: 'active',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    categories: [
      {
        id: 'budcat-1',
        budget_id: 'budget-2026',
        category: 'Billetterie',
        allocated_amount: 180000,
        spent_amount: 15000,
        percentage: 64.3,
        created_at: '2025-12-01T10:00:00Z',
        updated_at: '2026-01-29T10:00:00Z',
      },
      {
        id: 'budcat-2',
        budget_id: 'budget-2026',
        category: 'Bar',
        allocated_amount: 60000,
        spent_amount: 3200,
        percentage: 21.4,
        created_at: '2025-12-01T10:00:00Z',
        updated_at: '2026-01-29T10:00:00Z',
      },
      {
        id: 'budcat-3',
        budget_id: 'budget-2026',
        category: 'Cachets artistes',
        allocated_amount: 100000,
        spent_amount: 2500,
        percentage: 40,
        created_at: '2025-12-01T10:00:00Z',
        updated_at: '2026-01-29T10:00:00Z',
      },
      {
        id: 'budcat-4',
        budget_id: 'budget-2026',
        category: 'Location',
        allocated_amount: 50000,
        spent_amount: 5000,
        percentage: 20,
        created_at: '2025-12-01T10:00:00Z',
        updated_at: '2026-01-29T10:00:00Z',
      },
    ],
  },
]

export const DEMO_INVOICES: (Invoice & { invoice_lines: InvoiceLine[] })[] = [
  {
    id: 'inv-1',
    invoice_number: 'FAC-AW52LTG1',
    type: 'invoice',
    issue_date: '2026-01-10',
    due_date: '2026-02-10',
    status: 'paid',
    client_type: 'client',
    client_name: 'Mairie de Démo',
    client_address: '1 Place de la République',
    client_postal_code: '75000',
    client_city: 'Paris',
    client_email: 'contact@mairie-demo.fr',
    category: 'Subventions',
    subtotal_excl_tax: 8333.33,
    total_vat: 1666.67,
    total_incl_tax: 10000,
    payment_terms: '30 jours',
    payment_method: 'Virement',
    paid_date: '2026-01-25',
    notes: 'Subvention annuelle',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-25T14:00:00Z',
    invoice_lines: [
      {
        id: 'invline-1',
        invoice_id: 'inv-1',
        description: 'Subvention activités culturelles 2026',
        quantity: 1,
        unit_price_excl_tax: 8333.33,
        vat_rate: 20,
        amount_excl_tax: 8333.33,
        amount_vat: 1666.67,
        amount_incl_tax: 10000,
        order_index: 0,
        created_at: '2026-01-10T10:00:00Z',
      },
    ],
  },
  {
    id: 'inv-2',
    invoice_number: 'FAC-AW52LTG2',
    type: 'invoice',
    issue_date: '2026-01-20',
    due_date: '2026-02-20',
    status: 'pending',
    client_type: 'client',
    client_name: 'Entreprise Sponsor SA',
    client_address: '42 Avenue des Champs',
    client_postal_code: '75008',
    client_city: 'Paris',
    client_email: 'contact@sponsor.com',
    category: 'Partenariats',
    subtotal_excl_tax: 4166.67,
    total_vat: 833.33,
    total_incl_tax: 5000,
    payment_terms: '30 jours',
    payment_method: 'Virement',
    notes: 'Package sponsoring Gold',
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
    invoice_lines: [
      {
        id: 'invline-2',
        invoice_id: 'inv-2',
        description: 'Package sponsoring Gold - Festival Printemps 2026',
        quantity: 1,
        unit_price_excl_tax: 4166.67,
        vat_rate: 20,
        amount_excl_tax: 4166.67,
        amount_vat: 833.33,
        amount_incl_tax: 5000,
        order_index: 0,
        created_at: '2026-01-20T11:00:00Z',
      },
    ],
  },
]

export const DEMO_BUDGET_PROJECTS: BudgetProject[] = [
  {
    id: 'proj-1',
    title: 'Festival Printemps 2026',
    description: 'Grand festival de musique sur 3 jours',
    type: 'infrastructure',
    status: 'active',
    start_date: '2026-03-15',
    end_date: '2026-03-17',
    responsible: 'Marie Dupont',
    notes: 'Budget prévisionnel',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'proj-2',
    title: 'Nouvelle ligne merchandising',
    description: 'Création d\'une gamme de produits dérivés',
    type: 'merchandising',
    status: 'active',
    start_date: '2026-02-01',
    end_date: '2026-06-30',
    responsible: 'Paul Martin',
    notes: 'T-shirts, casquettes, posters',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
]

/**
 * Initialise localStorage avec les données de démonstration
 * À appeler au premier chargement de l'application
 */
export function initializeDemoData(): void {
  if (typeof window === 'undefined') return
  
  // FORCE la réinitialisation si une version corrompue existe
  const version = window.localStorage.getItem('finance_demo_version')
  const currentVersion = '3.0' // Version après migration base64
  
  if (version !== currentVersion) {
    console.log('🔄 Nouvelle version détectée, réinitialisation des données...')
    window.localStorage.removeItem('finance_demo_initialized')
  }
  
  // Vérifier si les données sont déjà initialisées
  const isInitialized = window.localStorage.getItem('finance_demo_initialized')
  if (isInitialized === 'true') {
    console.log('✅ Les données de démonstration sont déjà initialisées')
    // Vérifier que les données existent vraiment
    const transactions = window.localStorage.getItem('finance_transactions')
    if (transactions) {
      const parsedTransactions = JSON.parse(transactions)
      console.log(`📊 ${parsedTransactions.length} transactions chargées en localStorage`)
    }
    return
  }
  
  console.log('🔄 Initialisation des données de démonstration Finance...')
  
  // Bank Accounts
  saveToStorage('finance_bank_accounts', DEMO_BANK_ACCOUNTS)
  console.log(`✓ ${DEMO_BANK_ACCOUNTS.length} comptes bancaires`)
  
  // Transactions
  saveToStorage('finance_transactions', DEMO_TRANSACTIONS)
  console.log(`✓ ${DEMO_TRANSACTIONS.length} transactions`)
  
  // Budgets
  const budgets = DEMO_BUDGETS.map(({ categories, ...budget }) => budget)
  const categories = DEMO_BUDGETS.flatMap((b) => b.categories)
  saveToStorage('finance_budgets', budgets)
  saveToStorage('finance_budget_categories', categories)
  console.log(`✓ ${budgets.length} budgets avec ${categories.length} catégories`)
  
  // Invoices
  const invoices = DEMO_INVOICES.map(({ invoice_lines, ...invoice }) => invoice)
  const invoiceLines = DEMO_INVOICES.flatMap((i) => i.invoice_lines)
  saveToStorage('finance_invoices', invoices)
  saveToStorage('finance_invoice_lines', invoiceLines)
  console.log(`✓ ${invoices.length} factures avec ${invoiceLines.length} lignes`)
  
  // Budget Projects
  saveToStorage('finance_budget_projects', DEMO_BUDGET_PROJECTS)
  saveToStorage('finance_budget_project_lines', [])
  console.log(`✓ ${DEMO_BUDGET_PROJECTS.length} projets budgétaires`)
  
  // Marquer comme initialisé avec la version
  window.localStorage.setItem('finance_demo_initialized', 'true')
  window.localStorage.setItem('finance_demo_version', '3.0')
  
  console.log('✅ Données de démonstration initialisées avec succès!')
}

/**
 * Réinitialise les données de démonstration
 * Utile pour les tests
 */
export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  
  window.localStorage.removeItem('finance_demo_initialized')
  initializeDemoData()
}
