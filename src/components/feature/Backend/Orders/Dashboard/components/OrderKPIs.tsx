'use client';

import { OrderStats } from '@/types/order';
import { ShoppingCart, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules/Card';

interface OrderKPIsProps {
  stats: OrderStats;
}

export default function OrderKPIs({ stats }: OrderKPIsProps) {
  const kpis = [
    {
      label: 'Total Commandes',
      value: stats.total_orders,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Chiffre d\'Affaires',
      value: `${stats.total_revenue.toFixed(2)}€`,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Panier Moyen',
      value: `${stats.avg_order_value.toFixed(2)}€`,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'En Attente',
      value: stats.pending_orders,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className="border-zinc-200 dark:border-zinc-800"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{kpi.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.bg}`}>
                <kpi.icon size={24} className={kpi.color} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
