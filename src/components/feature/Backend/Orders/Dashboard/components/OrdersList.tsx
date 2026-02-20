'use client';

import { useState, useEffect } from 'react';
import { Order, OrderFilters } from '@/types/order';
import { orderDataService } from '@/lib/services/OrderDataService';
import { useOrder } from '@/components/providers';
import OrderCard from './OrderCard';
import { Card } from '@/components/ui/molecules/Card';

interface OrdersListProps {
  filters: OrderFilters;
}

export default function OrdersList({ filters }: OrdersListProps) {
  const { refreshTrigger } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger, filters]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderDataService.getOrders(filters);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">Chargement...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Aucune commande trouvée</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
