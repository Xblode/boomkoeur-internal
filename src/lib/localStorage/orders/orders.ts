// localStorage operations for Orders
import { Order, OrderInput, OrderFilters } from '@/types/order';
import {
  getFromStorage,
  saveToStorage,
  updateInStorage,
  deleteFromStorage,
  generateId,
  generateOrderNumber,
} from './storage';
import { getActiveOrgSlug } from '@/lib/supabase/activeOrg';

function getOrdersStorageKey(): string {
  return getActiveOrgSlug() === 'demo' ? 'orders_demo' : 'orders';
}

export function getOrders(): Order[] {
  return getFromStorage<Order[]>(getOrdersStorageKey(), []);
}

export function getOrderById(id: string): Order | null {
  const orders = getOrders();
  return orders.find((o) => o.id === id) || null;
}

export function getOrderByNumber(orderNumber: string): Order | null {
  const orders = getOrders();
  return orders.find((o) => o.order_number === orderNumber) || null;
}

export function createOrder(input: OrderInput): Order {
  const orders = getOrders();
  
  // Générer l'ID d'abord, puis utiliser cet ID pour générer le numéro de commande
  const newId = generateId();
  const order_number = generateOrderNumber(newId);
  
  const newOrder: Order = {
    ...input,
    id: newId,
    order_number,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  saveToStorage(getOrdersStorageKey(), orders);
  
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order {
  return updateInStorage<Order>(getOrdersStorageKey(), id, updates);
}

export function deleteOrder(id: string): void {
  deleteFromStorage<Order>(getOrdersStorageKey(), id);
}

export function filterOrders(filters: OrderFilters): Order[] {
  let orders = getOrders();
  
  // Search (numéro, nom client, email)
  if (filters.search) {
    const search = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(search) ||
        o.customer_name.toLowerCase().includes(search) ||
        o.customer_email.toLowerCase().includes(search)
    );
  }
  
  // Status
  if (filters.status && filters.status !== 'all') {
    orders = orders.filter((o) => o.status === filters.status);
  }
  
  // Source
  if (filters.source && filters.source !== 'all') {
    orders = orders.filter((o) => o.source === filters.source);
  }
  
  // Payment status
  if (filters.payment_status && filters.payment_status !== 'all') {
    orders = orders.filter((o) => o.payment_status === filters.payment_status);
  }
  
  // Date from
  if (filters.date_from) {
    const dateFrom = new Date(filters.date_from).getTime();
    orders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).getTime();
      return orderDate >= dateFrom;
    });
  }
  
  // Date to
  if (filters.date_to) {
    const dateTo = new Date(filters.date_to).getTime();
    orders = orders.filter((o) => {
      const orderDate = new Date(o.created_at).getTime();
      return orderDate <= dateTo;
    });
  }
  
  // Event
  if (filters.event_id) {
    orders = orders.filter((o) => o.event_id === filters.event_id);
  }
  
  return orders.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Plus récent en premier
  });
}
