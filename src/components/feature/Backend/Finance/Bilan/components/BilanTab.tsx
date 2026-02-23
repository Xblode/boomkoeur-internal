'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Card, CardContent, CardHeader, CardTitle, KPICard, SectionHeader } from '@/components/ui/molecules'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Landmark,
} from 'lucide-react'
import { LoadingState } from '../../shared/components'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type PeriodType = 'month' | 'quarter' | 'semester' | 'year'

interface BilanTabProps {
  periodType?: PeriodType
  selectedYear?: number
  selectedMonth?: number
}

// Ligne financière — design épuré
const FinancialLine = ({
  label,
  value,
  isTotal = false,
  accentClass = 'text-foreground',
}: {
  label: string
  value: number
  isTotal?: boolean
  accentClass?: string
}) => (
  <div
    className={cn(
      'flex justify-between items-center py-2.5 px-3 rounded-md transition-colors',
      isTotal
        ? 'bg-zinc-100 dark:bg-zinc-800/60 font-medium mt-2 -mx-1 px-4'
        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
    )}
  >
    <span className={cn('text-sm', isTotal ? 'font-semibold text-foreground' : 'text-zinc-500 dark:text-zinc-400')}>
      {label}
    </span>
    <span className={cn('font-mono text-sm tabular-nums', isTotal ? 'font-bold' : '', accentClass)}>
      {value.toLocaleString('fr-FR')} €
    </span>
  </div>
)

// Section financière — sous-blocs avec total
const FinancialSection = ({
  title,
  children,
  totalLabel,
  totalValue,
  accentClass,
}: {
  title: string
  children: React.ReactNode
  totalLabel: string
  totalValue: number
  accentClass: string
}) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 pl-1">
      {title}
    </h4>
    <div className="space-y-0.5 mb-2">{children}</div>
    <div
      className={cn(
        'flex justify-between items-center py-2.5 px-3 rounded-md border-t border-border-custom mt-2',
        accentClass
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wide">{totalLabel}</span>
      <span className="font-mono font-bold text-sm tabular-nums">{totalValue.toLocaleString('fr-FR')} €</span>
    </div>
  </div>
)

export default function BilanTab({ periodType: externalPeriodType, selectedYear: externalSelectedYear, selectedMonth: externalSelectedMonth }: BilanTabProps) {
  const periodType = externalPeriodType ?? 'year'
  const selectedYear = externalSelectedYear ?? new Date().getFullYear()
  const selectedMonth = externalSelectedMonth ?? new Date().getMonth() + 1
  const [loading, setLoading] = useState(true)
  const [profitLoss, setProfitLoss] = useState<any>(null)
  const [balanceSheet, setBalanceSheet] = useState<any>(null)
  const [ratios, setRatios] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [periodType, selectedYear, selectedMonth])

  async function loadData() {
    try {
      setLoading(true)
      const [pl, bs, r] = await Promise.all([
        financeDataService.getProfitAndLoss(periodType, selectedYear, selectedMonth),
        financeDataService.getBalanceSheet(periodType, selectedYear),
        financeDataService.getFinancialRatios(periodType, selectedYear),
      ])
      setProfitLoss(pl)
      setBalanceSheet(bs)
      setRatios(r)
    } catch (error) {
      console.error('Erreur lors du chargement des donnees:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement des donnees financieres..." className="h-96" />
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Section KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <KPICard
            label="Résultat net"
            value={`${(profitLoss?.result?.operatingResult || 0) >= 0 ? '+' : ''}${(profitLoss?.result?.operatingResult || 0).toLocaleString('fr-FR')}`}
            unit="€"
            icon={(profitLoss?.result?.operatingResult || 0) >= 0 ? TrendingUp : TrendingDown}
            subtext={`Marge: ${(profitLoss?.result?.grossMargin || 0).toFixed(1)}%`}
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            label="Liquidité"
            value={(ratios?.liquidityRatio || 0).toFixed(2)}
            icon={Wallet}
            subtext="Capacité de paiement"
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            label="Autonomie"
            value={((ratios?.autonomyRatio || 0) * 100).toFixed(1)}
            unit="%"
            icon={ShieldCheck}
            subtext="Indépendance financière"
          />
        </motion.div>
        <motion.div variants={item}>
          <KPICard
            label="Rentabilité (ROI)"
            value={(ratios?.roi || 0).toFixed(1)}
            unit="%"
            icon={Activity}
            subtext="Retour sur investissement"
          />
        </motion.div>
      </div>

      {/* Section 1 : Compte de résultat */}
      <motion.div variants={item} className="space-y-6">
        <SectionHeader
          title="Compte de résultat"
          icon={<BarChart3 size={24} className="text-zinc-500" />}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produits */}
          <Card className="overflow-hidden border-l-4 border-l-green-500/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <ArrowUpRight size={20} />
                </div>
                <CardTitle className="text-lg m-0">Produits (Revenus)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <FinancialSection
                title="Revenus événements"
                totalLabel="Total événements"
                totalValue={profitLoss?.products?.totalEventRevenues || 0}
                accentClass="text-green-600 dark:text-green-400"
              >
                <FinancialLine label="Billetterie" value={profitLoss?.products?.eventRevenues?.billetterie || 0} />
                <FinancialLine label="Bar" value={profitLoss?.products?.eventRevenues?.bar || 0} />
                <FinancialLine label="Merchandising" value={profitLoss?.products?.eventRevenues?.merchandising || 0} />
              </FinancialSection>
              <FinancialSection
                title="Partenariats"
                totalLabel="Total partenariats"
                totalValue={profitLoss?.products?.totalPartnerships || 0}
                accentClass="text-green-600 dark:text-green-400"
              >
                <FinancialLine label="Sponsors" value={profitLoss?.products?.partnerships?.sponsors || 0} />
                <FinancialLine label="Partenaires lieux" value={profitLoss?.products?.partnerships?.partners || 0} />
              </FinancialSection>
              <FinancialSection
                title="Autres produits"
                totalLabel="Total autres"
                totalValue={profitLoss?.products?.totalOtherProducts || 0}
                accentClass="text-green-600 dark:text-green-400"
              >
                <FinancialLine label="Adhésions" value={profitLoss?.products?.otherProducts?.adhesions || 0} />
                <FinancialLine label="Subventions" value={profitLoss?.products?.otherProducts?.subventions || 0} />
                <FinancialLine label="Services" value={profitLoss?.products?.otherProducts?.service || 0} />
                <FinancialLine label="Dons" value={profitLoss?.products?.otherProducts?.dons || 0} />
                <FinancialLine label="Divers" value={profitLoss?.products?.otherProducts?.autres || 0} />
              </FinancialSection>
              <div className="mt-6 pt-4 border-t-2 border-green-500/20 flex justify-between items-center bg-green-500/5 dark:bg-green-500/10 p-4 rounded-lg">
                <span className="font-semibold uppercase text-sm tracking-wide text-green-700 dark:text-green-400">
                  Total produits
                </span>
                <span className="font-mono font-bold text-lg tabular-nums text-green-700 dark:text-green-400">
                  {(profitLoss?.products?.totalProducts || 0).toLocaleString('fr-FR')} €
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Charges */}
          <Card className="overflow-hidden border-l-4 border-l-red-500/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                  <ArrowDownRight size={20} />
                </div>
                <CardTitle className="text-lg m-0">Charges (Dépenses)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <FinancialSection
                title="Charges événements"
                totalLabel="Total événements"
                totalValue={profitLoss?.charges?.totalEventCharges || 0}
                accentClass="text-red-600 dark:text-red-400"
              >
                <FinancialLine label="Location salles" value={profitLoss?.charges?.eventCharges?.location || 0} />
                <FinancialLine label="Artistes" value={profitLoss?.charges?.eventCharges?.artistes || 0} />
                <FinancialLine label="Technique & Sonorisation" value={profitLoss?.charges?.eventCharges?.technique || 0} />
                <FinancialLine label="Sécurité" value={profitLoss?.charges?.eventCharges?.securite || 0} />
              </FinancialSection>
              <FinancialSection
                title="Marketing & Communication"
                totalLabel="Total marketing"
                totalValue={profitLoss?.charges?.totalMarketingCharges || 0}
                accentClass="text-red-600 dark:text-red-400"
              >
                <FinancialLine label="Communication" value={profitLoss?.charges?.marketingCharges?.communication || 0} />
                <FinancialLine label="Graphisme" value={profitLoss?.charges?.marketingCharges?.graphisme || 0} />
              </FinancialSection>
              <FinancialSection
                title="Charges de structure"
                totalLabel="Total structure"
                totalValue={profitLoss?.charges?.totalStructureCharges || 0}
                accentClass="text-red-600 dark:text-red-400"
              >
                <FinancialLine label="Assurances" value={profitLoss?.charges?.structureCharges?.assurances || 0} />
                <FinancialLine label="Comptabilité" value={profitLoss?.charges?.structureCharges?.comptabilite || 0} />
                <FinancialLine label="Frais bancaires" value={profitLoss?.charges?.structureCharges?.fraisBancaires || 0} />
                <FinancialLine label="Logistique" value={profitLoss?.charges?.structureCharges?.logistique || 0} />
                <FinancialLine label="Divers" value={profitLoss?.charges?.structureCharges?.divers || 0} />
              </FinancialSection>
              <div className="mt-6 pt-4 border-t-2 border-red-500/20 flex justify-between items-center bg-red-500/5 dark:bg-red-500/10 p-4 rounded-lg">
                <span className="font-semibold uppercase text-sm tracking-wide text-red-700 dark:text-red-400">
                  Total charges
                </span>
                <span className="font-mono font-bold text-lg tabular-nums text-red-700 dark:text-red-400">
                  {(profitLoss?.charges?.totalCharges || 0).toLocaleString('fr-FR')} €
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Section 2 : Bilan patrimonial */}
      <motion.div variants={item} className="space-y-6">
        <SectionHeader
          title="Bilan patrimonial"
          icon={<Landmark size={24} className="text-zinc-500" />}
        />
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-custom">
              {/* Actif */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <DollarSign size={20} />
                  </div>
                  <CardTitle className="text-lg m-0 text-blue-600 dark:text-blue-400">Actif</CardTitle>
                </div>
                <FinancialSection
                  title="Actif circulant"
                  totalLabel="Total circulant"
                  totalValue={balanceSheet?.assets?.current?.total || 0}
                  accentClass="text-blue-600 dark:text-blue-400"
                >
                  <FinancialLine label="Trésorerie" value={balanceSheet?.assets?.current?.treasury || 0} />
                  <FinancialLine label="Créances clients" value={balanceSheet?.assets?.current?.receivables || 0} />
                  <FinancialLine label="Stocks" value={balanceSheet?.assets?.current?.stocks || 0} />
                </FinancialSection>
                <FinancialSection
                  title="Actif immobilisé"
                  totalLabel="Total immobilisé"
                  totalValue={balanceSheet?.assets?.fixed?.total || 0}
                  accentClass="text-blue-600 dark:text-blue-400"
                >
                  <FinancialLine label="Matériel technique" value={balanceSheet?.assets?.fixed?.technicalEquipment || 0} />
                  <FinancialLine label="Matériel informatique" value={balanceSheet?.assets?.fixed?.itEquipment || 0} />
                </FinancialSection>
                <div className="mt-6 pt-4 border-t-2 border-blue-500/20 flex justify-between items-center bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-lg">
                  <span className="font-semibold uppercase text-sm tracking-wide text-blue-700 dark:text-blue-400">
                    Total actif
                  </span>
                  <span className="font-mono font-bold text-lg tabular-nums text-blue-700 dark:text-blue-400">
                    {(balanceSheet?.assets?.total || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>

              {/* Passif */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <DollarSign size={20} />
                  </div>
                  <CardTitle className="text-lg m-0 text-purple-600 dark:text-purple-400">Passif</CardTitle>
                </div>
                <FinancialSection
                  title="Capitaux propres"
                  totalLabel="Total capitaux"
                  totalValue={balanceSheet?.liabilities?.equity?.total || 0}
                  accentClass="text-purple-600 dark:text-purple-400"
                >
                  <FinancialLine label="Fonds associatifs" value={balanceSheet?.liabilities?.equity?.associationFunds || 0} />
                  <FinancialLine label="Résultat de l'exercice" value={balanceSheet?.liabilities?.equity?.exerciseResult || 0} />
                </FinancialSection>
                <FinancialSection
                  title="Dettes"
                  totalLabel="Total dettes"
                  totalValue={balanceSheet?.liabilities?.debts?.total || 0}
                  accentClass="text-purple-600 dark:text-purple-400"
                >
                  <FinancialLine label="Dettes fournisseurs" value={balanceSheet?.liabilities?.debts?.payables || 0} />
                  <FinancialLine label="Emprunts" value={balanceSheet?.liabilities?.debts?.loans || 0} />
                  <FinancialLine label="Dettes fiscales et sociales" value={balanceSheet?.liabilities?.debts?.taxDebts || 0} />
                </FinancialSection>
                <div className="mt-6 pt-4 border-t-2 border-purple-500/20 flex justify-between items-center bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-lg">
                  <span className="font-semibold uppercase text-sm tracking-wide text-purple-700 dark:text-purple-400">
                    Total passif
                  </span>
                  <span className="font-mono font-bold text-lg tabular-nums text-purple-700 dark:text-purple-400">
                    {(balanceSheet?.liabilities?.total || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}