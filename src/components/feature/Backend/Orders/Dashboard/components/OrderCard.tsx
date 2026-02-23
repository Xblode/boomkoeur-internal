'use client';

import { Order } from '@/types/order';
import { Package, MapPin, CreditCard, User, Truck, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/atoms';
import { Card, CardContent } from '@/components/ui/molecules';

interface OrderCardProps {
  order: Order;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  cart: 'Panier',
  pending_payment: 'En attente',
  paid: 'Payée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  returned: 'Retournée',
  cancelled: 'Annulée',
};

const ORDER_STATUS_VARIANTS: Record<string, 'secondary' | 'warning' | 'success' | 'info' | 'destructive'> = {
  cart: 'secondary',
  pending_payment: 'warning',
  paid: 'success',
  preparing: 'info',
  shipped: 'info',
  delivered: 'success',
  returned: 'warning',
  cancelled: 'destructive',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const PAYMENT_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  refunded: 'secondary',
};

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manuelle',
  online_shop: 'Boutique',
  event: 'Événement',
};

export default function OrderCard({ order }: OrderCardProps) {
  const isEventPickup = order.source === 'event' && order.shipping_cost === 0;
  const isShipping = order.shipping && order.shipping_cost > 0;

  return (
    <Card variant="outline" className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
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
            <Badge variant={ORDER_STATUS_VARIANTS[order.status] ?? 'secondary'}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Badge>
            <Badge variant={PAYMENT_STATUS_VARIANTS[order.payment_status] ?? 'secondary'}>
              {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
            </Badge>
            {isEventPickup && (
              <Badge variant="outline" className="gap-1">
                <Calendar size={12} />
                Remise sur événement
              </Badge>
            )}
            {isShipping && (
              <Badge variant="info" className="gap-1">
                <Truck size={12} />
                Livraison
              </Badge>
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
                {SOURCE_LABELS[order.source] ?? order.source}
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
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
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
