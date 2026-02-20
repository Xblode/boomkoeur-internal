// Types pour le module Commandes

// Statuts workflow complet
export type OrderStatus = 
  | 'cart' // Panier (boutique en ligne)
  | 'pending_payment' // En attente paiement
  | 'paid' // Payée
  | 'preparing' // En préparation
  | 'shipped' // Expédiée
  | 'delivered' // Livrée
  | 'returned' // Retournée
  | 'cancelled'; // Annulée

// Source de la commande
export type OrderSource = 'manual' | 'online_shop' | 'event';

// Type de client
export type CustomerType = 'individual' | 'professional' | 'partner';

// Méthode de paiement
export type PaymentMethod = 'stripe' | 'card' | 'transfer' | 'cash' | 'paypal';

// Statut paiement
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Ligne de commande
export type OrderLine = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string; // Snapshot au moment de la commande
  variant_info?: string; // "M - Noir"
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total: number; // (unit_price * quantity) - discount
  notes?: string; // Personnalisation
};

// Adresse de livraison
export type ShippingAddress = {
  name: string;
  address_line1: string;
  address_line2?: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
};

// Livraison
export type Shipping = {
  carrier?: string; // Colissimo, Chronopost, DHL
  tracking_number?: string;
  cost: number;
  shipped_at?: Date | string;
  delivered_at?: Date | string;
  address: ShippingAddress;
};

// Commande
export type Order = {
  id: string;
  order_number: string; // Auto: CMD-2026-0001
  status: OrderStatus;
  source: OrderSource;
  
  // Client
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_type: CustomerType;
  
  // Montants
  subtotal: number; // Somme des lignes
  discount_total: number;
  shipping_cost: number;
  total: number; // subtotal - discount + shipping
  
  // Paiement
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  stripe_payment_id?: string; // ID Stripe
  paid_at?: Date | string;
  
  // Livraison
  shipping?: Shipping;
  
  // Événement lié
  event_id?: string;
  
  // Notes
  notes?: string;
  internal_notes?: string; // Privé
  
  created_at: Date | string;
  updated_at: Date | string;
};

// Filtres
export type OrderFilters = {
  search: string; // Numéro, client, email
  status: OrderStatus | 'all';
  source: OrderSource | 'all';
  payment_status: PaymentStatus | 'all';
  date_from?: Date;
  date_to?: Date;
  event_id?: string;
};

// KPI Dashboard
export type OrderStats = {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  pending_orders: number;
  orders_by_status: Record<OrderStatus, number>;
  revenue_by_source: Record<OrderSource, number>;
  top_products: Array<{
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
};

// Inputs pour création (sans champs auto-générés)
export type OrderInput = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
export type OrderLineInput = Omit<OrderLine, 'id'>;
