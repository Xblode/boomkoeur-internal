'use client';

import { OrderStats } from '@/types/order';
import { ShoppingCart, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { KPICard } from '@/components/ui/molecules';

interface OrderKPIsProps {
  stats: OrderStats;
}

export default function OrderKPIs({ stats }: OrderKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard label="Total Commandes" value={stats.total_orders} icon={ShoppingCart} />
      <KPICard label="Chiffre d'affaires" value={stats.total_revenue.toFixed(2)} unit="€" icon={DollarSign} />
      <KPICard label="Panier moyen" value={stats.avg_order_value.toFixed(2)} unit="€" icon={TrendingUp} />
      <KPICard label="En attente" value={stats.pending_orders} icon={Clock} />
    </div>
  );
}
