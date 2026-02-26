/**
 * Données de commandes démo pour le localStorage.
 * Utilisé au premier chargement du dashboard en mode démo.
 */

import type { Order, OrderLine } from '@/types/order';

function makeId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getDemoOrders(): Order[] {
  const now = new Date();
  const past = new Date(now);
  past.setDate(past.getDate() - 5);

  return [
    {
      id: makeId(),
      order_number: 'CMD-DEMO-0001',
      status: 'paid',
      source: 'event',
      customer_name: 'Marie Dupont',
      customer_email: 'marie.dupont@email.fr',
      customer_type: 'individual',
      subtotal: 65,
      discount_total: 0,
      shipping_cost: 5,
      total: 70,
      payment_method: 'card',
      payment_status: 'paid',
      paid_at: past.toISOString(),
      event_id: undefined,
      created_at: past.toISOString(),
      updated_at: past.toISOString(),
    },
    {
      id: makeId(),
      order_number: 'CMD-DEMO-0002',
      status: 'pending_payment',
      source: 'online_shop',
      customer_name: 'Jean Martin',
      customer_email: 'jean.martin@email.fr',
      customer_type: 'individual',
      subtotal: 50,
      discount_total: 5,
      shipping_cost: 5,
      total: 50,
      payment_status: 'pending',
      event_id: undefined,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];
}

export function getDemoOrderLines(orders: Order[]): OrderLine[] {
  const order1 = orders.find((o) => o.order_number === 'CMD-DEMO-0001');
  const order2 = orders.find((o) => o.order_number === 'CMD-DEMO-0002');
  if (!order1 || !order2) return [];

  return [
    {
      id: makeId(),
      order_id: order1.id,
      product_id: 'demo-prod-1',
      product_name: 'T-shirt Perret',
      variant_info: 'M - Noir',
      quantity: 2,
      unit_price: 25,
      discount_amount: 0,
      total: 50,
    },
    {
      id: makeId(),
      order_id: order1.id,
      product_id: 'demo-prod-2',
      product_name: 'Affiche Soirée Électro',
      quantity: 1,
      unit_price: 15,
      discount_amount: 0,
      total: 15,
    },
    {
      id: makeId(),
      order_id: order2.id,
      product_id: 'demo-prod-1',
      product_name: 'T-shirt Perret',
      variant_info: 'L - Blanc',
      quantity: 2,
      unit_price: 25,
      discount_amount: 5,
      total: 45,
    },
  ];
}
