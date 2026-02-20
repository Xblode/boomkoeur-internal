'use client';

import { Order } from '@/types/order';
import { Package, MapPin, CreditCard, User, Truck, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules/Card';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusColors: Record<string, string> = {
    cart: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    refunded: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  };

  const sourceLabels: Record<string, string> = {
    manual: 'Manuelle',
    online_shop: 'Boutique',
    event: 'Événement',
  };

  // Déterminer le type de livraison
  const isEventPickup = order.source === 'event' && order.shipping_cost === 0;
  const isShipping = order.shipping && order.shipping_cost > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {order.order_number}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                statusColors[order.status]
              }`}
            >
              {order.status}
            </span>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                paymentStatusColors[order.payment_status]
              }`}
            >
              {order.payment_status}
            </span>
            
            {/* Badge Type de Livraison */}
            {isEventPickup && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Calendar size={12} />
                Remise sur événement
              </span>
            )}
            {isShipping && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Truck size={12} />
                Livraison
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Customer */}
          <div className="flex items-start gap-2">
            <User size={16} className="text-zinc-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {order.customer_name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.customer_email}</p>
            </div>
          </div>

          {/* Source */}
          <div className="flex items-start gap-2">
            <Package size={16} className="text-zinc-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {sourceLabels[order.source]}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.customer_type}</p>
            </div>
          </div>

          {/* Shipping Address - Afficher l'adresse complète pour les livraisons */}
          {order.shipping && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-zinc-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {isShipping ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {order.shipping.carrier || 'Transporteur à définir'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {order.shipping.address.address_line1}
                      {order.shipping.address.address_line2 && `, ${order.shipping.address.address_line2}`}
                      <br />
                      {order.shipping.address.postal_code} {order.shipping.address.city}
                    </p>
                  </>
                ) : isEventPickup ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Remise en main propre
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Lors de l'événement
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {order.shipping.address.city}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Retrait local
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {order.payment_method || 'Non défini'}
              </span>
            </div>
            {order.shipping && order.shipping.tracking_number && (
              <Badge variant="outline">
                Suivi: {order.shipping.tracking_number}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {order.total.toFixed(2)}€
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sous-total: {order.subtotal.toFixed(2)}€ + Livraison:{' '}
              {order.shipping_cost.toFixed(2)}€
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
