'use client';

import { useState, useEffect } from 'react';
import { useOrder } from '@/components/providers';
import { orderDataService } from '@/lib/services/OrderDataService';
import { OrderStats, OrderFilters } from '@/types/order';
import OrderKPIs from './OrderKPIs';
import OrdersList from './OrdersList';
import { SectionHeader } from '@/components/ui/molecules';
import { ShoppingCart } from 'lucide-react';

interface OrdersDashboardProps {
  filters: OrderFilters;
}

export default function OrdersDashboard({ filters }: OrdersDashboardProps) {
  const { refreshTrigger } = useOrder();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await orderDataService.getOrderStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading order stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<ShoppingCart size={28} />}
        title="Commandes"
        subtitle="Suivez vos commandes et livraisons"
      />

      {/* KPIs */}
      {isLoading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : stats ? (
        <OrderKPIs stats={stats} />
      ) : null}

      {/* Orders List */}
      <OrdersList filters={filters} />
    </div>
  );
}
