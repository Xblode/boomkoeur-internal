"use client";

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import { Card } from '@/components/ui/molecules';
import { useProductDetail } from './ProductDetailProvider';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

interface OrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  customer_name: string;
  status: string;
  source: string;
  total: number;
  items: OrderItem[];
  created_at: string | Date;
}

const STATUS_LABELS: Record<string, string> = {
  cart: 'Panier',
  pending_payment: 'En attente',
  paid: 'Payée',
  preparing: 'Préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  returned: 'Retournée',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  cart: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function ProductOrdersSection() {
  const { product } = useProductDetail();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [product.id]);

  const loadOrders = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('orders');
      if (stored) {
        const allOrders: Order[] = JSON.parse(stored);
        const filtered = allOrders.filter(o =>
          o.items?.some(item => item.product_id === product.id)
        );
        setOrders(filtered);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-zinc-500">Chargement...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border-custom rounded-lg">
        <ShoppingCart size={40} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
        <p className="text-zinc-500">Aucune commande liée à ce produit</p>
        <p className="text-sm text-zinc-400 mt-1">Les commandes apparaîtront ici lorsqu&apos;elles incluront ce produit</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<ShoppingCart size={28} />}
        title="Commandes"
      />
      <p className="text-sm text-zinc-500">{orders.length} commande{orders.length > 1 ? 's' : ''} contenant ce produit</p>

      <Card variant="outline" className="overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-card-bg">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Commande</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Source</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Qté produit</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {orders.map(order => {
              const productItems = order.items?.filter(i => i.product_id === product.id) || [];
              const totalQty = productItems.reduce((acc, i) => acc + i.quantity, 0);
              return (
                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-mono text-zinc-500">{order.id.substring(0, 8)}...</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{order.customer_name}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', STATUS_COLORS[order.status] || 'bg-zinc-100 text-zinc-700')}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {order.source === 'manual' ? 'Manuelle' : order.source === 'online_shop' ? 'En ligne' : 'Événement'}
                  </td>
                  <td className="px-4 py-2.5 text-sm font-semibold">{totalQty}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold">{order.total.toFixed(2)}€</td>
                  <td className="px-4 py-2.5 text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
