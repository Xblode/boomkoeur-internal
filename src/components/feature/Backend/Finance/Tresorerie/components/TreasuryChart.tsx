import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/molecules'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { LoadingState, EmptyState } from '@/components/feature/Backend/Finance/shared/components'

type PeriodType = 'month' | 'quarter' | 'year'

interface ChartData {
  date: string
  balance: number
  income: number
  expense: number
}

interface TreasuryChartProps {
  data: ChartData[]
  loading: boolean
  period: PeriodType
  className?: string
}

export default function TreasuryChart({ 
  data, 
  loading, 
  period,
  className = '' 
}: TreasuryChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (period === 'year') {
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (data.length === 0 && !loading) {
    return (
      <div className={className}>
        <EmptyState
          icon={TrendingUp}
          title="Aucune donnee disponible"
          description="Creez des transactions pour voir l'evolution"
          className="h-96"
        />
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-8">
        {loading ? (
          <LoadingState message="Chargement des donnees..." className="h-96" />
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#888"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  tickFormatter={(value) => `${value.toLocaleString('fr-FR')} EUR`}
                  stroke="#888"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString('fr-FR')}`}
                  formatter={(value: number | undefined, name: string | undefined) => {
                    const val = value ?? 0
                    const nameStr = name ?? ''
                    if (nameStr === 'balance') {
                      return [`${val.toLocaleString('fr-FR')} EUR`, 'Tresorerie']
                    }
                    return [`${val.toLocaleString('fr-FR')} EUR`, nameStr === 'income' ? 'Entrees' : 'Sorties']
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'balance') return 'Tresorerie'
                    if (value === 'income') return 'Entrees'
                    if (value === 'expense') return 'Sorties'
                    return value
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#FF5500"
                  strokeWidth={3}
                  dot={false}
                  name="balance"
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
