'use client';

import { Select } from '@/components/ui/atoms';
import { getAvailableYears } from '@/lib/years';

export type PeriodType = 'month' | 'quarter' | 'semester' | 'year';

export interface PeriodSelectorProps {
  periodType: PeriodType;
  onPeriodTypeChange: (type: PeriodType) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedMonth?: number;
  onMonthChange?: (month: number) => void;
  className?: string;
}

const MONTHS = [
  { value: '1', label: 'Janvier' },
  { value: '2', label: 'Février' },
  { value: '3', label: 'Mars' },
  { value: '4', label: 'Avril' },
  { value: '5', label: 'Mai' },
  { value: '6', label: 'Juin' },
  { value: '7', label: 'Juillet' },
  { value: '8', label: 'Août' },
  { value: '9', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

export function PeriodSelector({
  periodType,
  onPeriodTypeChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  className = '',
}: PeriodSelectorProps) {
  const years = getAvailableYears();

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <div className="w-48">
        <Select
          value={periodType}
          onChange={(e) => onPeriodTypeChange(e.target.value as PeriodType)}
          options={[
            { value: 'month', label: 'Mois' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'semester', label: 'Semestre' },
            { value: 'year', label: 'Année' },
          ]}
        />
      </div>

      {periodType === 'month' && selectedMonth !== undefined && onMonthChange && (
        <div className="w-40">
          <Select
            value={selectedMonth.toString()}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            options={MONTHS}
          />
        </div>
      )}

      <div className="w-32">
        <Select
          value={selectedYear.toString()}
          onChange={(e) => onYearChange(Number(e.target.value))}
          options={years.map((y) => ({ value: y.toString(), label: y.toString() }))}
        />
      </div>
    </div>
  );
}
