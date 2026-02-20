import { TrendingUp } from 'lucide-react'
import { Select } from '@/components/ui/atoms'
import { SectionHeader } from '@/components/feature/Backend/Finance/shared/components'

type PeriodType = 'month' | 'quarter' | 'year'

interface TreasuryChartHeaderProps {
  period: PeriodType
  selectedYear: number
  onPeriodChange: (period: PeriodType) => void
  onYearChange: (year: number) => void
}

export default function TreasuryChartHeader({
  period,
  selectedYear,
  onPeriodChange,
  onYearChange,
}: TreasuryChartHeaderProps) {
  return (
    <SectionHeader
      icon={TrendingUp}
      title="Evolution de tresorerie"
      actions={
        <>
          <div className="w-32">
            <Select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value as PeriodType)}
              options={[
                { value: 'month', label: 'Mois' },
                { value: 'quarter', label: 'Trimestre' },
                { value: 'year', label: 'Annee' },
              ]}
              className="h-[38px]"
            />
          </div>
          <div className="w-32">
            <Select
              value={selectedYear.toString()}
              onChange={(e) => onYearChange(Number(e.target.value))}
              options={[
                { value: '2025', label: '2025' },
                { value: '2026', label: '2026' },
                { value: '2027', label: '2027' },
                { value: '2028', label: '2028' },
              ]}
              className="h-[38px]"
            />
          </div>
        </>
      }
    />
  )
}
