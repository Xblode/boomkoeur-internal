'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TresorerieTabEnhanced } from './Tresorerie/components'
import { TransactionsTab } from './Transactions/components'
import { FacturesTab } from './Factures/components'
import { BilanTab } from './Bilan/components'
import { BudgetTab } from './Budget/components'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Plus, FileUp, FileDown, CheckCheck, Settings, Filter, ChevronDown, Package, FileText as FileTextIcon, Receipt, PieChart, FileText, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToolbar } from '@/components/providers/ToolbarProvider'
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms'
import { DropdownPanel } from '@/components/ui/molecules'
import { Button, Input, Label } from '@/components/ui/atoms'
import { SectionHeader } from '@/components/ui'
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
import { useFinanceLayout } from './FinanceLayoutConfig'

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
        <PageToolbar
          filters={
            <PageToolbarFilters>
              <div className="relative">
                <Button
                  ref={filterButtonRef}
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5",
                    "bg-transparent border-zinc-700 text-zinc-400",
                    "hover:text-white hover:border-zinc-500"
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
                </Button>

                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsFilterDropdownOpen(false)}
                      />
                      <DropdownPanel
                        style={getDropdownPosition(filterButtonRef)}
                        className="min-w-[300px] max-w-[400px] max-h-[600px] overflow-y-auto p-4"
                        data-filter-dropdown={true}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Recherche
                            </Label>
                            <Input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Rechercher une transaction..."
                              fullWidth
                              className="bg-zinc-100 dark:bg-zinc-800 border-border-custom"
                            />
                          </div>

                          <div>
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Type
                            </Label>
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
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Catégorie
                            </Label>
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
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Statut
                            </Label>
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
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Événement
                            </Label>
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
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Projet
                            </Label>
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
                            <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                              Contact
                            </Label>
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
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setFilterType('all')
                                setFilterCategory('all')
                                setFilterStatus('all')
                                setFilterEventId('all')
                                setFilterProjectId('all')
                                setFilterContactId('all')
                                setSearchQuery('')
                              }}
                              className="w-full"
                            >
                              Réinitialiser les filtres
                            </Button>
                          )}
                        </div>
                      </DropdownPanel>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </PageToolbarFilters>
          }
          actions={
            <PageToolbarActions>
              <Button onClick={() => setShowCategoriesModal(true)}>
                <Settings className="w-3 h-3 mr-1.5" />
                Catégories
              </Button>
              <Button onClick={() => setShowReconciliationModal(true)}>
                <CheckCheck className="w-3 h-3 mr-1.5" />
                Rapprochement
              </Button>
              <Button onClick={() => exportTransactionsExcel(transactions, selectedYear)}>
                <FileDown className="w-3 h-3 mr-1.5" />
                Export Excel
              </Button>
              <Button onClick={() => setShowImportCSVModal(true)}>
                <FileUp className="w-3 h-3 mr-1.5" />
                Import CSV
              </Button>
              <Button onClick={() => setShowNewTransactionModal(true)}>
                <Plus className="w-3 h-3 mr-1.5" />
                Nouvelle transaction
              </Button>
            </PageToolbarActions>
          }
        />
      )
      return () => { setToolbar(null) }
    }

    if (activeSection === 'budget') {
      setToolbar(
        <PageToolbar
          filters={
            <PageToolbarFilters>
              {/* Status dropdown */}
              <div className="relative">
                <Button
                  ref={budgetStatusButtonRef}
                  variant="outline"
                  size="sm"
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
                </Button>

                <AnimatePresence>
                  {isBudgetStatusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsBudgetStatusDropdownOpen(false)}
                      />
                      <DropdownPanel
                        style={getDropdownPosition(budgetStatusButtonRef)}
                        className="min-w-[120px]"
                      >
                        <div className="py-1">
                          {[
                            { value: 'all', label: 'Tous' },
                            { value: 'planned', label: 'Planifiés' },
                            { value: 'ongoing', label: 'En cours' },
                            { value: 'completed', label: 'Terminés' },
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setBudgetFilterStatus(option.value as any)
                                setIsBudgetStatusDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full justify-start px-3 py-1.5 text-xs font-medium transition-colors",
                                budgetFilterStatus === option.value
                                  ? "bg-accent text-white"
                                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                              )}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </DropdownPanel>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </PageToolbarFilters>
          }
          actions={
            <PageToolbarActions>
              <Button onClick={() => setShowManageTemplatesModal(true)}>
                <Settings className="w-3 h-3 mr-1.5" />
                Templates
              </Button>
              <Button onClick={() => setShowCreateProjectModal(true)}>
                <Package className="w-3 h-3 mr-1.5" />
                Nouveau projet
              </Button>
            </PageToolbarActions>
          }
        />
      )
      return () => { setToolbar(null) }
    }

    if (activeSection === 'factures') {
      setToolbar(
        <PageToolbar
          filters={
            <PageToolbarFilters>
              <div className="relative">
                <Button
                  ref={invoiceStatusButtonRef}
                  variant="outline"
                  size="sm"
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
                </Button>

                <AnimatePresence>
                  {isInvoiceStatusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsInvoiceStatusDropdownOpen(false)}
                      />
                      <DropdownPanel
                        style={getDropdownPosition(invoiceStatusButtonRef)}
                        className="min-w-[120px]"
                      >
                        <div className="py-1">
                          {[
                            { value: 'all', label: 'Toutes' },
                            { value: 'quote', label: 'Devis' },
                            { value: 'pending', label: 'En attente' },
                            { value: 'paid', label: 'Payées' },
                            { value: 'overdue', label: 'En retard' },
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setInvoiceFilterStatus(option.value as any)
                                setIsInvoiceStatusDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full justify-start px-3 py-1.5 text-xs font-medium transition-colors",
                                invoiceFilterStatus === option.value
                                  ? "bg-accent text-white"
                                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                              )}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </DropdownPanel>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </PageToolbarFilters>
          }
          actions={
            <PageToolbarActions>
              <Button
                onClick={() => {
                  setInvoiceType('quote')
                  setShowNewInvoiceModal(true)
                }}
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Nouveau devis
              </Button>
              <Button
                onClick={() => {
                  setInvoiceType('invoice')
                  setShowNewInvoiceModal(true)
                }}
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Nouvelle facture
              </Button>
            </PageToolbarActions>
          }
        />
      )
      return () => { setToolbar(null) }
    }

    if (activeSection === 'bilan') {
      const exportBilanPdf = async () => {
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
                return `T${Math.floor((bilanMonth - 1) / 3) + 1} ${selectedYear}`
              case 'semester':
                return `S${bilanMonth <= 6 ? 1 : 2} ${selectedYear}`
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
      }
      const exportBilanExcelFn = async () => {
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
                return `T${Math.floor((bilanMonth - 1) / 3) + 1} ${selectedYear}`
              case 'semester':
                return `S${bilanMonth <= 6 ? 1 : 2} ${selectedYear}`
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
      }
      setToolbar(
        <PageToolbar
          filters={
            <PageToolbarFilters>
              <div className="relative">
                <Button
                  ref={bilanPeriodButtonRef}
                  variant="outline"
                  size="sm"
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
                </Button>

                <AnimatePresence>
                  {isBilanPeriodDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setIsBilanPeriodDropdownOpen(false)}
                      />
                      <DropdownPanel
                        style={getDropdownPosition(bilanPeriodButtonRef)}
                        className="min-w-[120px]"
                      >
                        <div className="py-1">
                          {[
                            { value: 'month', label: 'Mois' },
                            { value: 'quarter', label: 'Trimestre' },
                            { value: 'semester', label: 'Semestre' },
                            { value: 'year', label: 'Année' },
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setBilanPeriodType(option.value as any)
                                setIsBilanPeriodDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full justify-start px-3 py-1.5 text-xs font-medium transition-colors",
                                bilanPeriodType === option.value
                                  ? "bg-accent text-white"
                                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                              )}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </DropdownPanel>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Month dropdown (when period is month/quarter/semester) */}
              {(bilanPeriodType === 'month' || bilanPeriodType === 'quarter' || bilanPeriodType === 'semester') && (
                <div className="relative">
                  <Button
                    ref={bilanMonthButtonRef}
                    variant="outline"
                    size="sm"
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
                  </Button>

                  <AnimatePresence>
                    {isBilanMonthDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[100]"
                          onClick={() => setIsBilanMonthDropdownOpen(false)}
                        />
                        <DropdownPanel
                          style={getDropdownPosition(bilanMonthButtonRef)}
                          className="min-w-[150px]"
                        >
                          <div className="py-1">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <Button
                                key={month}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setBilanMonth(month)
                                  setIsBilanMonthDropdownOpen(false)
                                }}
                                className={cn(
                                  "w-full justify-start px-3 py-1.5 text-xs font-medium transition-colors",
                                  bilanMonth === month
                                    ? "bg-accent text-white"
                                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
                                )}
                              >
                                {new Date(selectedYear, month - 1).toLocaleDateString('fr-FR', { month: 'long' })}
                              </Button>
                            ))}
                          </div>
                        </DropdownPanel>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </PageToolbarFilters>
          }
          actions={
            <PageToolbarActions>
              <Button onClick={exportBilanPdf}>
                <FileTextIcon className="w-3 h-3 mr-1.5" />
                Export PDF
              </Button>
              <Button onClick={exportBilanExcelFn}>
                <FileDown className="w-3 h-3 mr-1.5" />
                Export Excel
              </Button>
            </PageToolbarActions>
          }
        />
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

  const SECTION_HEADERS: Record<string, { icon: React.ReactNode; title: string; subtitle?: string }> = {
    transactions: { icon: <Receipt size={28} />, title: 'Transactions', subtitle: 'Gérez vos entrées et sorties, importez et rapprochez vos opérations.' },
    budget: { icon: <PieChart size={28} />, title: 'Budget', subtitle: 'Planifiez et suivez vos budgets par événement ou projet.' },
    factures: { icon: <FileText size={28} />, title: 'Factures', subtitle: 'Créez et suivez vos factures et devis.' },
    bilan: { icon: <BarChart3 size={28} />, title: 'Bilan', subtitle: 'Compte de résultat, bilan et ratios financiers.' },
  }
  const sectionHeaderConfig = activeSection !== 'tresorerie' ? SECTION_HEADERS[activeSection] : null

  return (
    <>
      {sectionHeaderConfig && (
        <div className="mb-6">
          <SectionHeader
            icon={sectionHeaderConfig.icon}
            title={sectionHeaderConfig.title}
            subtitle={sectionHeaderConfig.subtitle}
          />
        </div>
      )}
      {/* Section content */}
      <div className="min-h-[500px]">
        {activeSection === 'tresorerie' && (
          <TresorerieTabEnhanced
            selectedYear={selectedYear}
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
            selectedYear={selectedYear}
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
