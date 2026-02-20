'use client'

import { useState, useEffect } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Card, CardContent } from '@/components/ui/molecules'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Wallet, 
  ShieldCheck, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight 
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

// Composant interne pour les lignes de tableau
const FinancialLine = ({ label, value, isTotal = false, colorClass = "text-zinc-900 dark:text-zinc-100" }: { label: string, value: number, isTotal?: boolean, colorClass?: string }) => (
  <div className={cn(
    "flex justify-between items-center py-2 px-3 rounded-md transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
    isTotal && "bg-zinc-50 dark:bg-zinc-800/50 font-medium mt-2"
  )}>
    <span className={cn("text-sm", isTotal ? "font-semibold" : "text-zinc-500 dark:text-zinc-400")}>{label}</span>
    <span className={cn("font-mono text-sm", isTotal ? "font-bold" : "", colorClass)}>
      {value.toLocaleString('fr-FR')} €
    </span>
  </div>
)

// Composant interne pour les sections
const FinancialSection = ({ title, children, totalLabel, totalValue, totalColorClass }: { title: string, children: React.ReactNode, totalLabel: string, totalValue: number, totalColorClass: string }) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 pl-3">{title}</h4>
    <div className="space-y-0.5 mb-3">
      {children}
    </div>
    <div className="flex justify-between items-center py-3 px-3 border-t border-zinc-200 dark:border-zinc-800 mt-2">
      <span className={cn("font-bold uppercase text-sm", totalColorClass)}>{totalLabel}</span>
      <span className={cn("font-mono font-bold text-base", totalColorClass)}>{totalValue.toLocaleString('fr-FR')} €</span>
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
      {/* Section KPI (Remontee en haut) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resultat Net */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800",
                  (profitLoss?.result?.operatingResult || 0) >= 0 ? "text-green-500 bg-green-50 dark:bg-green-900/20" : "text-red-500 bg-red-50 dark:bg-red-900/20"
                )}>
                  {(profitLoss?.result?.operatingResult || 0) >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Resultat Net</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {(profitLoss?.result?.operatingResult || 0) >= 0 ? '+' : ''}
                      {(profitLoss?.result?.operatingResult || 0).toLocaleString('fr-FR')} €
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Marge: <span className="font-medium text-zinc-600 dark:text-zinc-300">{(profitLoss?.result?.grossMargin || 0).toFixed(1)}%</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liquidite */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Liquidite</p>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{(ratios?.liquidityRatio || 0).toFixed(2)}</h3>
                  <p className="text-xs text-zinc-400 mt-1">Capacite de paiement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Autonomie */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Autonomie</p>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{((ratios?.autonomyRatio || 0) * 100).toFixed(1)}%</h3>
                  <p className="text-xs text-zinc-400 mt-1">Independance financiere</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ROI */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rentabilite (ROI)</p>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{(ratios?.roi || 0).toFixed(1)}%</h3>
                  <p className="text-xs text-zinc-400 mt-1">Retour sur investissement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section 1 : Compte de resultat */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="font-heading text-xl font-bold uppercase text-zinc-900 dark:text-zinc-100">Compte de resultat</h3>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produits */}
          <Card className="overflow-hidden">
            <div className="bg-green-500/5 border-b border-green-500/10 p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-full text-green-600 dark:text-green-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Produits (Revenus)</h4>
            </div>
            <CardContent className="p-6">
              <FinancialSection 
                title="Revenus evenements" 
                totalLabel="Total evenements" 
                totalValue={profitLoss?.products?.totalEventRevenues || 0}
                totalColorClass="text-green-600 dark:text-green-400"
              >
                <FinancialLine label="Billetterie" value={profitLoss?.products?.eventRevenues?.billetterie || 0} />
                <FinancialLine label="Bar" value={profitLoss?.products?.eventRevenues?.bar || 0} />
                <FinancialLine label="Merchandising" value={profitLoss?.products?.eventRevenues?.merchandising || 0} />
              </FinancialSection>

              <FinancialSection 
                title="Partenariats" 
                totalLabel="Total partenariats" 
                totalValue={profitLoss?.products?.totalPartnerships || 0}
                totalColorClass="text-green-600 dark:text-green-400"
              >
                <FinancialLine label="Sponsors" value={profitLoss?.products?.partnerships?.sponsors || 0} />
                <FinancialLine label="Partenaires lieux" value={profitLoss?.products?.partnerships?.partners || 0} />
              </FinancialSection>

              <FinancialSection 
                title="Autres produits" 
                totalLabel="Total autres" 
                totalValue={profitLoss?.products?.totalOtherProducts || 0}
                totalColorClass="text-green-600 dark:text-green-400"
              >
                <FinancialLine label="Adhesions" value={profitLoss?.products?.otherProducts?.adhesions || 0} />
                <FinancialLine label="Subventions" value={profitLoss?.products?.otherProducts?.subventions || 0} />
                <FinancialLine label="Services" value={profitLoss?.products?.otherProducts?.service || 0} />
                <FinancialLine label="Dons" value={profitLoss?.products?.otherProducts?.dons || 0} />
                <FinancialLine label="Divers" value={profitLoss?.products?.otherProducts?.autres || 0} />
              </FinancialSection>

              <div className="mt-8 pt-4 border-t-2 border-green-500/20 flex justify-between items-center bg-green-500/5 p-4 rounded-lg">
                <span className="font-heading font-bold uppercase text-lg text-green-700 dark:text-green-400">TOTAL PRODUITS</span>
                <span className="font-mono font-bold text-xl text-green-700 dark:text-green-400">{(profitLoss?.products?.totalProducts || 0).toLocaleString('fr-FR')} €</span>
              </div>
            </CardContent>
          </Card>

          {/* Charges */}
          <Card className="overflow-hidden">
            <div className="bg-red-500/5 border-b border-red-500/10 p-4 flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-full text-red-600 dark:text-red-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Charges (Depenses)</h4>
            </div>
            <CardContent className="p-6">
              <FinancialSection 
                title="Charges evenements" 
                totalLabel="Total evenements" 
                totalValue={profitLoss?.charges?.totalEventCharges || 0}
                totalColorClass="text-red-600 dark:text-red-400"
              >
                <FinancialLine label="Location salles" value={profitLoss?.charges?.eventCharges?.location || 0} />
                <FinancialLine label="Artistes" value={profitLoss?.charges?.eventCharges?.artistes || 0} />
                <FinancialLine label="Technique & Sonorisation" value={profitLoss?.charges?.eventCharges?.technique || 0} />
                <FinancialLine label="Securite" value={profitLoss?.charges?.eventCharges?.securite || 0} />
              </FinancialSection>

              <FinancialSection 
                title="Marketing & Communication" 
                totalLabel="Total marketing" 
                totalValue={profitLoss?.charges?.totalMarketingCharges || 0}
                totalColorClass="text-red-600 dark:text-red-400"
              >
                <FinancialLine label="Communication" value={profitLoss?.charges?.marketingCharges?.communication || 0} />
                <FinancialLine label="Graphisme" value={profitLoss?.charges?.marketingCharges?.graphisme || 0} />
              </FinancialSection>

              <FinancialSection 
                title="Charges de structure" 
                totalLabel="Total structure" 
                totalValue={profitLoss?.charges?.totalStructureCharges || 0}
                totalColorClass="text-red-600 dark:text-red-400"
              >
                <FinancialLine label="Assurances" value={profitLoss?.charges?.structureCharges?.assurances || 0} />
                <FinancialLine label="Comptabilite" value={profitLoss?.charges?.structureCharges?.comptabilite || 0} />
                <FinancialLine label="Frais bancaires" value={profitLoss?.charges?.structureCharges?.fraisBancaires || 0} />
                <FinancialLine label="Logistique" value={profitLoss?.charges?.structureCharges?.logistique || 0} />
                <FinancialLine label="Divers" value={profitLoss?.charges?.structureCharges?.divers || 0} />
              </FinancialSection>

              <div className="mt-8 pt-4 border-t-2 border-red-500/20 flex justify-between items-center bg-red-500/5 p-4 rounded-lg">
                <span className="font-heading font-bold uppercase text-lg text-red-700 dark:text-red-400">TOTAL CHARGES</span>
                <span className="font-mono font-bold text-xl text-red-700 dark:text-red-400">{(profitLoss?.charges?.totalCharges || 0).toLocaleString('fr-FR')} €</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Section 2 : Bilan Patrimonial */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-6 mt-8">
          <h3 className="font-heading text-xl font-bold uppercase text-zinc-900 dark:text-zinc-100">Bilan Patrimonial</h3>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"></div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
              {/* Actif */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold uppercase text-blue-600 dark:text-blue-400">ACTIF</h3>
                </div>

                <FinancialSection 
                  title="Actif circulant" 
                  totalLabel="Total circulant" 
                  totalValue={balanceSheet?.assets?.current?.total || 0}
                  totalColorClass="text-blue-600 dark:text-blue-400"
                >
                  <FinancialLine label="Tresorerie" value={balanceSheet?.assets?.current?.treasury || 0} />
                  <FinancialLine label="Creances clients" value={balanceSheet?.assets?.current?.receivables || 0} />
                  <FinancialLine label="Stocks" value={balanceSheet?.assets?.current?.stocks || 0} />
                </FinancialSection>

                <FinancialSection 
                  title="Actif immobilise" 
                  totalLabel="Total immobilise" 
                  totalValue={balanceSheet?.assets?.fixed?.total || 0}
                  totalColorClass="text-blue-600 dark:text-blue-400"
                >
                  <FinancialLine label="Materiel technique" value={balanceSheet?.assets?.fixed?.technicalEquipment || 0} />
                  <FinancialLine label="Materiel informatique" value={balanceSheet?.assets?.fixed?.itEquipment || 0} />
                </FinancialSection>

                <div className="mt-8 pt-4 border-t-2 border-blue-500/20 flex justify-between items-center bg-blue-500/5 p-4 rounded-lg">
                  <span className="font-heading font-bold uppercase text-lg text-blue-700 dark:text-blue-400">TOTAL ACTIF</span>
                  <span className="font-mono font-bold text-xl text-blue-700 dark:text-blue-400">{(balanceSheet?.assets?.total || 0).toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              {/* Passif */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold uppercase text-purple-600 dark:text-purple-400">PASSIF</h3>
                </div>

                <FinancialSection 
                  title="Capitaux propres" 
                  totalLabel="Total capitaux" 
                  totalValue={balanceSheet?.liabilities?.equity?.total || 0}
                  totalColorClass="text-purple-600 dark:text-purple-400"
                >
                  <FinancialLine label="Fonds associatifs" value={balanceSheet?.liabilities?.equity?.associationFunds || 0} />
                  <FinancialLine label="Resultat de l'exercice" value={balanceSheet?.liabilities?.equity?.exerciseResult || 0} />
                </FinancialSection>

                <FinancialSection 
                  title="Dettes" 
                  totalLabel="Total dettes" 
                  totalValue={balanceSheet?.liabilities?.debts?.total || 0}
                  totalColorClass="text-purple-600 dark:text-purple-400"
                >
                  <FinancialLine label="Dettes fournisseurs" value={balanceSheet?.liabilities?.debts?.payables || 0} />
                  <FinancialLine label="Emprunts" value={balanceSheet?.liabilities?.debts?.loans || 0} />
                  <FinancialLine label="Dettes fiscales et sociales" value={balanceSheet?.liabilities?.debts?.taxDebts || 0} />
                </FinancialSection>

                <div className="mt-8 pt-4 border-t-2 border-purple-500/20 flex justify-between items-center bg-purple-500/5 p-4 rounded-lg">
                  <span className="font-heading font-bold uppercase text-lg text-purple-700 dark:text-purple-400">TOTAL PASSIF</span>
                  <span className="font-mono font-bold text-xl text-purple-700 dark:text-purple-400">{(balanceSheet?.liabilities?.total || 0).toLocaleString('fr-FR')} EUR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}