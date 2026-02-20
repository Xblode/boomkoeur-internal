'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TresorerieTabEnhanced } from './Tresorerie/components'
import { TransactionsTab } from './Transactions/components'
import { FacturesTab } from './Factures/components'
import { BilanTab } from './Bilan/components'
import { BudgetTab } from './Budget/components'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Plus, FileUp, FileDown, CheckCheck, Settings, Filter, ChevronDown, Package, FileText as FileTextIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToolbar } from '@/components/providers/ToolbarProvider'
import { PageToolbar } from '@/components/ui/organisms'
import {
  NewTransactionModal,
  ImportCSVModal,
  BankReconciliationModal,
  CategoriesManagementModal
} from './Transactions/modals'
import { exportTransactionsExcel, exportBilanPDF, exportBilanExcel } from '@/lib/utils/finance/export-transactions'
import { Select } from '@/components/ui/atoms'
import {
  CreateEventBudgetModal,
  CreateBudgetProjectModal,
  ManageBudgetTemplatesModal
} from './Budget/modals'
import { NewInvoiceModal } from './Factures/modals'
import { useFinanceLayout } from './FinanceLayout'

export default function FinancePage() {
  const { activeSection, selectedYear } = useFinanceLayout()

  const [stats, setStats] = useState<any>(null)
  const [pendingInvoices, setPendingInvoices] = useState<number>(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Transactions state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showImportCSVModal, setShowImportCSVModal] = useState(false)
  const [showReconciliationModal, setShowReconciliationModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])

  // Transaction filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'validated' | 'reconciled'>('all')
  const [filterEventId, setFilterEventId] = useState<string>('all')
  const [filterProjectId, setFilterProjectId] = useState<string>('all')
  const [filterContactId, setFilterContactId] = useState<string>('all')

  // Budget state
  const [budgetFilterStatus, setBudgetFilterStatus] = useState<'all' | 'planned' | 'ongoing' | 'completed'>('all')
  const [isBudgetStatusDropdownOpen, setIsBudgetStatusDropdownOpen] = useState(false)
  const [showCreateBudgetModal, setShowCreateBudgetModal] = useState(false)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [showManageTemplatesModal, setShowManageTemplatesModal] = useState(false)
  const [selectedEventForBudget, setSelectedEventForBudget] = useState<string | null>(null)
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<string | null>(null)

  // Factures state
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<'all' | 'quote' | 'pending' | 'paid' | 'overdue'>('all')
  const [isInvoiceStatusDropdownOpen, setIsInvoiceStatusDropdownOpen] = useState(false)
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'invoice' | 'quote'>('invoice')

  // Bilan state
  const [bilanPeriodType, setBilanPeriodType] = useState<'month' | 'quarter' | 'semester' | 'year'>('year')
  const [bilanMonth, setBilanMonth] = useState(new Date().getMonth() + 1)
  const [isBilanPeriodDropdownOpen, setIsBilanPeriodDropdownOpen] = useState(false)
  const [isBilanMonthDropdownOpen, setIsBilanMonthDropdownOpen] = useState(false)

  // Refs for dropdown positioning
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const budgetStatusButtonRef = useRef<HTMLButtonElement>(null)
  const invoiceStatusButtonRef = useRef<HTMLButtonElement>(null)
  const bilanPeriodButtonRef = useRef<HTMLButtonElement>(null)
  const bilanMonthButtonRef = useRef<HTMLButtonElement>(null)

  const allEvents = useMemo<any[]>(() => [], [])
  const allContacts = useMemo<any[]>(() => [], [])
  const [allProjects, setAllProjects] = useState<any[]>([])

  useEffect(() => {
    financeDataService.getBudgetProjects().then(setAllProjects).catch(console.error)
  }, [])

  const allCategories = useMemo(() => {
    const categories = new Set<string>()
    transactions.forEach((t) => {
      if (t.category) categories.add(t.category)
    })
    return Array.from(categories).sort()
  }, [transactions])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filterType !== 'all') count++
    if (filterCategory !== 'all') count++
    if (filterStatus !== 'all') count++
    if (filterEventId !== 'all') count++
    if (filterProjectId !== 'all') count++
    if (filterContactId !== 'all') count++
    return count
  }, [filterType, filterCategory, filterStatus, filterEventId, filterProjectId, filterContactId])

  const { setToolbar } = useToolbar()

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (activeSection === 'transactions') {
      financeDataService.getTransactions(selectedYear).then(setTransactions).catch(console.error)
    }
  }, [activeSection, selectedYear])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const filterMenu = document.querySelector('[data-filter-dropdown]')
      if (filterMenu && filterMenu.contains(target)) return
      if (filterButtonRef.current && !filterButtonRef.current.contains(target)) {
        setIsFilterDropdownOpen(false)
      }
    }

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFilterDropdownOpen])

  const getDropdownPosition = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!ref.current) return { top: 0, left: 0 }
    const rect = ref.current.getBoundingClientRect()
    return {
      top: rect.bottom + 4,
      left: rect.left,
    }
  }

  // ── Toolbar per section ──
  useEffect(() => {
    if (activeSection === 'tresorerie') {
      setToolbar(null)
      return () => { setToolbar(null) }
    }

    if (activeSection === 'transactions') {
      setToolbar(
        <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 flex-1 h-full">
            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {/* Filter button */}
              <div className="relative">
                <button
                  ref={filterButtonRef}
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    "bg-transparent border border-zinc-700 text-zinc-400",
                    "hover:text-white hover:border-zinc-500",
                    "focus:outline-none focus:border-accent"
                  )}
                >
                  <Filter className="w-3 h-3" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    isFilterDropdownOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg min-w-[300px] max-w-[400px] max-h-[600px] overflow-y-auto p-4"
                        style={getDropdownPosition(filterButtonRef)}
                        data-filter-dropdown
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Recherche
                            </label>
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Rechercher une transaction..."
                              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Type
                            </label>
                            <Select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value as any)}
                              options={[
                                { value: 'all', label: 'Tous' },
                                { value: 'income', label: 'Entrées' },
                                { value: 'expense', label: 'Sorties' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Catégorie
                            </label>
                            <Select
                              value={filterCategory}
                              onChange={(e) => setFilterCategory(e.target.value)}
                              options={[
                                { value: 'all', label: 'Toutes' },
                                ...allCategories.map((cat) => ({ value: cat, label: cat })),
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Statut
                            </label>
                            <Select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value as any)}
                              options={[
                                { value: 'all', label: 'Tous' },
                                { value: 'pending', label: 'En attente' },
                                { value: 'validated', label: 'Validé' },
                                { value: 'reconciled', label: 'Rapproché' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Événement
                            </label>
                            <Select
                              value={filterEventId}
                              onChange={(e) => setFilterEventId(e.target.value)}
                              options={[
                                { value: 'all', label: 'Tous' },
                                ...allEvents.map((e) => ({ value: e.id, label: e.title })),
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Projet
                            </label>
                            <Select
                              value={filterProjectId}
                              onChange={(e) => setFilterProjectId(e.target.value)}
                              options={[
                                { value: 'all', label: 'Tous' },
                                ...allProjects.map((p) => ({ value: p.id, label: p.title })),
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Contact
                            </label>
                            <Select
                              value={filterContactId}
                              onChange={(e) => setFilterContactId(e.target.value)}
                              options={[
                                { value: 'all', label: 'Tous' },
                                ...allContacts.map((c) => ({ value: c.id, label: c.name })),
                              ]}
                            />
                          </div>

                          {(activeFiltersCount > 0 || searchQuery) && (
                            <button
                              onClick={() => {
                                setFilterType('all')
                                setFilterCategory('all')
                                setFilterStatus('all')
                                setFilterEventId('all')
                                setFilterProjectId('all')
                                setFilterContactId('all')
                                setSearchQuery('')
                              }}
                              className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground transition-colors"
                            >
                              Réinitialiser les filtres
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-zinc-500">|</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoriesModal(true)}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3 h-3" />
                Catégories
              </button>
              <button
                onClick={() => setShowReconciliationModal(true)}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-3 h-3" />
                Rapprochement
              </button>
              <button
                onClick={() => {
                  exportTransactionsExcel(transactions, selectedYear)
                }}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-3 h-3" />
                Export Excel
              </button>
              <button
                onClick={() => setShowImportCSVModal(true)}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <FileUp className="w-3 h-3" />
                Import CSV
              </button>
              <button
                onClick={() => setShowNewTransactionModal(true)}
                className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Nouvelle transaction
              </button>
            </div>
          </div>
        </PageToolbar>
      )
      return () => { setToolbar(null) }
    }

    if (activeSection === 'budget') {
      setToolbar(
        <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 flex-1 h-full">
            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {/* Status dropdown */}
              <div className="relative">
                <button
                  ref={budgetStatusButtonRef}
                  onClick={() => setIsBudgetStatusDropdownOpen(!isBudgetStatusDropdownOpen)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    "bg-transparent border border-zinc-700 text-zinc-400",
                    "hover:text-white hover:border-zinc-500",
                    "focus:outline-none focus:border-accent"
                  )}
                >
                  {budgetFilterStatus === 'all' ? 'Tous' : budgetFilterStatus === 'planned' ? 'Planifiés' : budgetFilterStatus === 'ongoing' ? 'En cours' : 'Terminés'}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    isBudgetStatusDropdownOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {isBudgetStatusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsBudgetStatusDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg min-w-[120px]"
                        style={getDropdownPosition(budgetStatusButtonRef)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          {[
                            { value: 'all', label: 'Tous' },
                            { value: 'planned', label: 'Planifiés' },
                            { value: 'ongoing', label: 'En cours' },
                            { value: 'completed', label: 'Terminés' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setBudgetFilterStatus(option.value as any)
                                setIsBudgetStatusDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                budgetFilterStatus === option.value
                                  ? "bg-accent text-white"
                                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-zinc-500">|</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManageTemplatesModal(true)}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3 h-3" />
                Templates
              </button>
              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3 h-3" />
                Nouveau projet
              </button>
            </div>
          </div>
        </PageToolbar>
      )
      return () => { setToolbar(null) }
    }

    if (activeSection === 'factures') {
      setToolbar(
        <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 flex-1 h-full">
            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {/* Status dropdown */}
              <div className="relative">
                <button
                  ref={invoiceStatusButtonRef}
                  onClick={() => setIsInvoiceStatusDropdownOpen(!isInvoiceStatusDropdownOpen)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    "bg-transparent border border-zinc-700 text-zinc-400",
                    "hover:text-white hover:border-zinc-500",
                    "focus:outline-none focus:border-accent"
                  )}
                >
                  {invoiceFilterStatus === 'all' ? 'Toutes' : invoiceFilterStatus === 'quote' ? 'Devis' : invoiceFilterStatus === 'pending' ? 'En attente' : invoiceFilterStatus === 'paid' ? 'Payées' : 'En retard'}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    isInvoiceStatusDropdownOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {isInvoiceStatusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsInvoiceStatusDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg min-w-[120px]"
                        style={getDropdownPosition(invoiceStatusButtonRef)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          {[
                            { value: 'all', label: 'Toutes' },
                            { value: 'quote', label: 'Devis' },
                            { value: 'pending', label: 'En attente' },
                            { value: 'paid', label: 'Payées' },
                            { value: 'overdue', label: 'En retard' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setInvoiceFilterStatus(option.value as any)
                                setIsInvoiceStatusDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                invoiceFilterStatus === option.value
                                  ? "bg-accent text-white"
                                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-zinc-500">|</div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setInvoiceType('quote')
                  setShowNewInvoiceModal(true)
                }}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Nouveau devis
              </button>
              <button
                onClick={() => {
                  setInvoiceType('invoice')
                  setShowNewInvoiceModal(true)
                }}
                className="px-2 py-1 bg-white text-black rounded text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                Nouvelle facture
              </button>
            </div>
          </div>
        </PageToolbar>
      )
      return () => { setToolbar(null) }
    }

    if (activeSection === 'bilan') {
      setToolbar(
        <PageToolbar className="justify-between bg-[#171717] h-10 min-h-0 p-0 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 flex-1 h-full">
            <div className="flex-1" />

            <div className="flex items-center gap-2">
              {/* Period dropdown */}
              <div className="relative">
                <button
                  ref={bilanPeriodButtonRef}
                  onClick={() => setIsBilanPeriodDropdownOpen(!isBilanPeriodDropdownOpen)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                    "bg-transparent border border-zinc-700 text-zinc-400",
                    "hover:text-white hover:border-zinc-500",
                    "focus:outline-none focus:border-accent"
                  )}
                >
                  {bilanPeriodType === 'month' ? 'Mois' : bilanPeriodType === 'quarter' ? 'Trimestre' : bilanPeriodType === 'semester' ? 'Semestre' : 'Année'}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    isBilanPeriodDropdownOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {isBilanPeriodDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsBilanPeriodDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg min-w-[120px]"
                        style={getDropdownPosition(bilanPeriodButtonRef)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          {[
                            { value: 'month', label: 'Mois' },
                            { value: 'quarter', label: 'Trimestre' },
                            { value: 'semester', label: 'Semestre' },
                            { value: 'year', label: 'Année' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setBilanPeriodType(option.value as any)
                                setIsBilanPeriodDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                bilanPeriodType === option.value
                                  ? "bg-accent text-white"
                                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Month dropdown (when period is month/quarter/semester) */}
              {(bilanPeriodType === 'month' || bilanPeriodType === 'quarter' || bilanPeriodType === 'semester') && (
                <div className="relative">
                  <button
                    ref={bilanMonthButtonRef}
                    onClick={() => setIsBilanMonthDropdownOpen(!isBilanMonthDropdownOpen)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5",
                      "bg-transparent border border-zinc-700 text-zinc-400",
                      "hover:text-white hover:border-zinc-500",
                      "focus:outline-none focus:border-accent"
                    )}
                  >
                    {new Date(selectedYear, bilanMonth - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                    <ChevronDown className={cn(
                      "w-3 h-3 transition-transform",
                      isBilanMonthDropdownOpen && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {isBilanMonthDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[100]"
                          onClick={() => setIsBilanMonthDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed z-[101] bg-card-bg border border-border-custom rounded shadow-lg min-w-[150px]"
                          style={getDropdownPosition(bilanMonthButtonRef)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <button
                                key={month}
                                onClick={() => {
                                  setBilanMonth(month)
                                  setIsBilanMonthDropdownOpen(false)
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors",
                                  bilanMonth === month
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {new Date(selectedYear, month - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="text-zinc-500">|</div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const [pl, bs, r] = await Promise.all([
                      financeDataService.getProfitAndLoss(bilanPeriodType, selectedYear, bilanMonth),
                      financeDataService.getBalanceSheet(bilanPeriodType, selectedYear),
                      financeDataService.getFinancialRatios(bilanPeriodType, selectedYear),
                    ])
                    const getPeriodLabel = () => {
                      switch (bilanPeriodType) {
                        case 'month':
                          return `Mois de ${new Date(selectedYear, bilanMonth - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                        case 'quarter':
                          const quarter = Math.floor((bilanMonth - 1) / 3) + 1
                          return `T${quarter} ${selectedYear}`
                        case 'semester':
                          const semester = bilanMonth <= 6 ? 1 : 2
                          return `S${semester} ${selectedYear}`
                        case 'year':
                          return `Année ${selectedYear}`
                        default:
                          return `Période ${selectedYear}`
                      }
                    }
                    await exportBilanPDF(pl, bs, r, getPeriodLabel())
                  } catch (error) {
                    console.error('Erreur lors de l\'export PDF:', error)
                    alert('Erreur lors de l\'export PDF')
                  }
                }}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <FileTextIcon className="w-3 h-3" />
                Export PDF
              </button>
              <button
                onClick={async () => {
                  try {
                    const [pl, bs, r] = await Promise.all([
                      financeDataService.getProfitAndLoss(bilanPeriodType, selectedYear, bilanMonth),
                      financeDataService.getBalanceSheet(bilanPeriodType, selectedYear),
                      financeDataService.getFinancialRatios(bilanPeriodType, selectedYear),
                    ])
                    const getPeriodLabel = () => {
                      switch (bilanPeriodType) {
                        case 'month':
                          return `Mois de ${new Date(selectedYear, bilanMonth - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                        case 'quarter':
                          const quarter = Math.floor((bilanMonth - 1) / 3) + 1
                          return `T${quarter} ${selectedYear}`
                        case 'semester':
                          const semester = bilanMonth <= 6 ? 1 : 2
                          return `S${semester} ${selectedYear}`
                        case 'year':
                          return `Année ${selectedYear}`
                        default:
                          return `Période ${selectedYear}`
                      }
                    }
                    await exportBilanExcel(pl, bs, r, getPeriodLabel())
                  } catch (error) {
                    console.error('Erreur lors de l\'export Excel:', error)
                    alert('Erreur lors de l\'export Excel')
                  }
                }}
                className="px-2 py-1 bg-transparent border border-zinc-700 text-zinc-400 rounded text-xs font-medium hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-3 h-3" />
                Export Excel
              </button>
            </div>
          </div>
        </PageToolbar>
      )
      return () => { setToolbar(null) }
    }

    return () => { setToolbar(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, selectedYear, isFilterDropdownOpen, activeFiltersCount, allCategories, allEvents, allProjects, allContacts, budgetFilterStatus, isBudgetStatusDropdownOpen, invoiceFilterStatus, isInvoiceStatusDropdownOpen, bilanPeriodType, bilanMonth, isBilanPeriodDropdownOpen, isBilanMonthDropdownOpen])

  async function loadStats() {
    try {
      const data = await financeDataService.getFinanceKPIs()
      setStats(data)
      const pendingCount = await financeDataService.getPendingInvoicesCount()
      setPendingInvoices(pendingCount)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  return (
    <>
      {/* Section content */}
      <div className="min-h-[500px]">
        {activeSection === 'tresorerie' && (
          <TresorerieTabEnhanced
            refreshTrigger={refreshTrigger}
            onAddTransaction={() => setShowNewTransactionModal(true)}
          />
        )}
        {activeSection === 'transactions' && (
          <TransactionsTab
            selectedYear={selectedYear}
            searchQuery={searchQuery}
            filterType={filterType}
            filterCategory={filterCategory}
            filterStatus={filterStatus}
            filterEventId={filterEventId}
            filterProjectId={filterProjectId}
            filterContactId={filterContactId}
            onTransactionChange={() => {
              setRefreshTrigger((prev) => prev + 1)
              loadStats()
              financeDataService.getTransactions(selectedYear).then(setTransactions).catch(console.error)
            }}
            onCreateTransaction={() => setShowNewTransactionModal(true)}
          />
        )}
        {activeSection === 'budget' && (
          <BudgetTab
            selectedYear={selectedYear}
            filterStatus={budgetFilterStatus}
            onCreateBudget={(eventId) => {
              setSelectedEventForBudget(eventId)
              setShowCreateBudgetModal(true)
            }}
            onEditProject={(projectId) => {
              setSelectedProjectForEdit(projectId)
              setShowCreateProjectModal(true)
            }}
            onCreateProject={() => setShowCreateProjectModal(true)}
          />
        )}
        {activeSection === 'factures' && (
          <FacturesTab
            filterStatus={invoiceFilterStatus}
            onCreateInvoice={() => {
              setInvoiceType('invoice')
              setShowNewInvoiceModal(true)
            }}
          />
        )}
        {activeSection === 'bilan' && (
          <BilanTab
            periodType={bilanPeriodType}
            selectedYear={selectedYear}
            selectedMonth={bilanMonth}
          />
        )}
      </div>

      {/* Budget modals */}
      {activeSection === 'budget' && (
        <>
          <CreateEventBudgetModal
            isOpen={showCreateBudgetModal}
            onClose={() => {
              setShowCreateBudgetModal(false)
              setSelectedEventForBudget(null)
            }}
            onSuccess={() => {
              setShowCreateBudgetModal(false)
              setSelectedEventForBudget(null)
            }}
            eventId={selectedEventForBudget}
          />

          <CreateBudgetProjectModal
            isOpen={showCreateProjectModal}
            onClose={() => {
              setShowCreateProjectModal(false)
              setSelectedProjectForEdit(null)
            }}
            onSuccess={() => {
              setShowCreateProjectModal(false)
              setSelectedProjectForEdit(null)
            }}
            projectId={selectedProjectForEdit}
          />

          <ManageBudgetTemplatesModal
            isOpen={showManageTemplatesModal}
            onClose={() => setShowManageTemplatesModal(false)}
            onSuccess={() => {}}
          />
        </>
      )}

      {/* Transaction modals */}
      {activeSection === 'transactions' && (
        <>
          <NewTransactionModal
            isOpen={showNewTransactionModal}
            onClose={() => setShowNewTransactionModal(false)}
            onSuccess={() => {
              setRefreshTrigger((prev) => prev + 1)
              loadStats()
              financeDataService.getTransactions(selectedYear).then(setTransactions).catch(console.error)
            }}
          />

          <ImportCSVModal
            isOpen={showImportCSVModal}
            onClose={() => setShowImportCSVModal(false)}
            onSuccess={() => {
              setRefreshTrigger((prev) => prev + 1)
              loadStats()
              financeDataService.getTransactions(selectedYear).then(setTransactions).catch(console.error)
            }}
          />

          <BankReconciliationModal
            isOpen={showReconciliationModal}
            onClose={() => setShowReconciliationModal(false)}
            onSuccess={() => {
              setRefreshTrigger((prev) => prev + 1)
              loadStats()
              financeDataService.getTransactions(selectedYear).then(setTransactions).catch(console.error)
            }}
          />

          <CategoriesManagementModal
            isOpen={showCategoriesModal}
            onClose={() => setShowCategoriesModal(false)}
            onSuccess={() => {}}
          />
        </>
      )}

      {/* Invoice modals */}
      {activeSection === 'factures' && (
        <NewInvoiceModal
          isOpen={showNewInvoiceModal}
          onClose={() => {
            setShowNewInvoiceModal(false)
            setInvoiceType('invoice')
          }}
          onSuccess={() => {
            setShowNewInvoiceModal(false)
            setInvoiceType('invoice')
            setRefreshTrigger((prev) => prev + 1)
            loadStats()
          }}
          type={invoiceType}
        />
      )}
    </>
  )
}
