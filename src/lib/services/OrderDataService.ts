// Order Data Service - Interface abstraction for future Supabase migration
import {
  Order,
  OrderInput,
  OrderLine,
  OrderLineInput,
  OrderFilters,
  OrderStats,
  OrderStatus,
  PaymentStatus,
} from '@/types/order';

import * as ordersStorage from '@/lib/localStorage/orders/orders';
import * as orderLinesStorage from '@/lib/localStorage/orders/orderLines';
import * as statsStorage from '@/lib/localStorage/orders/stats';

// Interface pour le service
export interface IOrderDataService {
  // Orders
  getOrders(filters?: OrderFilters): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(order: OrderInput): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
  
  // Order Lines
  getOrderLines(orderId: string): Promise<OrderLine[]>;
  addOrderLine(line: OrderLineInput): Promise<OrderLine>;
  updateOrderLine(id: string, updates: Partial<OrderLine>): Promise<OrderLine>;
  removeOrderLine(id: string): Promise<void>;
  
  // Stats
  getOrderStats(filters?: { dateFrom?: Date; dateTo?: Date }): Promise<OrderStats>;
  
  // Status updates
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
    stripeId?: string
  ): Promise<void>;
}

// Implementation avec localStorage
class LocalStorageOrderService implements IOrderDataService {
  // Orders
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    if (filters) {
      return ordersStorage.filterOrders(filters);
    }
    return ordersStorage.getOrders();
  }

  async getOrderById(id: string): Promise<Order | null> {
    return ordersStorage.getOrderById(id);
  }

  async createOrder(order: OrderInput): Promise<Order> {
    return ordersStorage.createOrder(order);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return ordersStorage.updateOrder(id, updates);
  }

  async deleteOrder(id: string): Promise<void> {
    // Supprimer également les lignes de commande
    orderLinesStorage.removeOrderLinesByOrderId(id);
    ordersStorage.deleteOrder(id);
  }

  // Order Lines
  async getOrderLines(orderId: string): Promise<OrderLine[]> {
    return orderLinesStorage.getOrderLinesByOrderId(orderId);
  }

  async addOrderLine(line: OrderLineInput): Promise<OrderLine> {
    return orderLinesStorage.addOrderLine(line);
  }

  async updateOrderLine(
    id: string,
    updates: Partial<OrderLine>
  ): Promise<OrderLine> {
    return orderLinesStorage.updateOrderLine(id, updates);
  }

  async removeOrderLine(id: string): Promise<void> {
    orderLinesStorage.removeOrderLine(id);
  }

  // Stats
  async getOrderStats(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<OrderStats> {
    return statsStorage.getOrderStats(filters);
  }

  // Status updates
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const updates: Partial<Order> = { status };
    
    // Si le statut est "paid", enregistrer la date de paiement
    if (status === 'paid' && !ordersStorage.getOrderById(orderId)?.paid_at) {
      updates.paid_at = new Date().toISOString();
      updates.payment_status = 'paid';
    }
    
    // Si le statut est "shipped", enregistrer la date d'expédition
    if (status === 'shipped') {
      const order = ordersStorage.getOrderById(orderId);
      if (order?.shipping) {
        updates.shipping = {
          ...order.shipping,
          shipped_at: new Date().toISOString(),
        };
      }
    }
    
    // Si le statut est "delivered", enregistrer la date de livraison
    if (status === 'delivered') {
      const order = ordersStorage.getOrderById(orderId);
      if (order?.shipping) {
        updates.shipping = {
          ...order.shipping,
          delivered_at: new Date().toISOString(),
        };
      }
    }
    
    ordersStorage.updateOrder(orderId, updates);
  }

  async updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
    stripeId?: string
  ): Promise<void> {
    const updates: Partial<Order> = {
      payment_status: status,
    };
    
    if (stripeId) {
      updates.stripe_payment_id = stripeId;
    }
    
    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
      updates.status = 'paid';
    }
    
    ordersStorage.updateOrder(orderId, updates);
  }
}

// Singleton export
export const orderDataService: IOrderDataService = new LocalStorageOrderService();
