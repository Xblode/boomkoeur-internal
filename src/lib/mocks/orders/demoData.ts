// Demo data for Orders module
import { Order, OrderLine } from '@/types/order';

const DEMO_VERSION = '2.0'; // Version avec codes base64
const VERSION_KEY = 'orders_demo_version';

// Commandes démo
export const DEMO_ORDERS: Order[] = [
  {
    id: 'order-1',
    order_number: 'CMD-B3JKZXIT',
    status: 'delivered',
    source: 'online_shop',
    customer_name: 'Alice Durand',
    customer_email: 'alice.durand@email.fr',
    customer_phone: '+33 6 12 34 56 78',
    customer_type: 'individual',
    subtotal: 75.0,
    discount_total: 0,
    shipping_cost: 5.0,
    total: 80.0,
    payment_method: 'stripe',
    payment_status: 'paid',
    stripe_payment_id: 'pi_1234567890',
    paid_at: '2026-01-15T10:30:00.000Z',
    shipping: {
      carrier: 'Colissimo',
      tracking_number: 'AB123456789FR',
      cost: 5.0,
      shipped_at: '2026-01-16T09:00:00.000Z',
      delivered_at: '2026-01-18T14:30:00.000Z',
      address: {
        name: 'Alice Durand',
        address_line1: '12 rue de la République',
        postal_code: '75001',
        city: 'Paris',
        country: 'France',
        phone: '+33 6 12 34 56 78',
      },
    },
    notes: 'Livraison rapide SVP',
    created_at: '2026-01-15T10:00:00.000Z',
    updated_at: '2026-01-18T14:30:00.000Z',
  },
  {
    id: 'order-2',
    order_number: 'CMD-B3JKZXIU',
    status: 'shipped',
    source: 'online_shop',
    customer_name: 'Marc Leblanc',
    customer_email: 'marc.leblanc@email.fr',
    customer_phone: '+33 6 98 76 54 32',
    customer_type: 'individual',
    subtotal: 50.0,
    discount_total: 5.0,
    shipping_cost: 5.0,
    total: 50.0,
    payment_method: 'stripe',
    payment_status: 'paid',
    stripe_payment_id: 'pi_0987654321',
    paid_at: '2026-01-20T14:00:00.000Z',
    shipping: {
      carrier: 'Chronopost',
      tracking_number: 'CD987654321FR',
      cost: 5.0,
      shipped_at: '2026-01-21T11:00:00.000Z',
      address: {
        name: 'Marc Leblanc',
        address_line1: '45 avenue des Champs',
        postal_code: '69002',
        city: 'Lyon',
        country: 'France',
        phone: '+33 6 98 76 54 32',
      },
    },
    created_at: '2026-01-20T13:30:00.000Z',
    updated_at: '2026-01-21T11:00:00.000Z',
  },
  {
    id: 'order-3',
    order_number: 'CMD-B3JKZXIV',
    status: 'paid',
    source: 'event',
    customer_name: 'Sophie Martin',
    customer_email: 'sophie.martin@email.fr',
    customer_type: 'individual',
    subtotal: 40.0,
    discount_total: 0,
    shipping_cost: 0,
    total: 40.0,
    payment_method: 'cash',
    payment_status: 'paid',
    paid_at: '2026-01-22T18:30:00.000Z',
    event_id: 'event-jazz-2026',
    notes: 'Vente sur place - Concert Jazz Night',
    internal_notes: 'Client régulier',
    created_at: '2026-01-22T18:30:00.000Z',
    updated_at: '2026-01-22T18:30:00.000Z',
  },
  {
    id: 'order-4',
    order_number: 'CMD-B3JKZXIW',
    status: 'preparing',
    source: 'online_shop',
    customer_name: 'Thomas Rousseau',
    customer_email: 'thomas.rousseau@email.fr',
    customer_phone: '+33 7 11 22 33 44',
    customer_type: 'professional',
    subtotal: 150.0,
    discount_total: 30.0,
    shipping_cost: 10.0,
    total: 130.0,
    payment_method: 'transfer',
    payment_status: 'paid',
    paid_at: '2026-01-25T09:00:00.000Z',
    shipping: {
      cost: 10.0,
      address: {
        name: 'Entreprise Rousseau SARL',
        address_line1: '8 boulevard du Commerce',
        address_line2: 'Bâtiment B',
        postal_code: '31000',
        city: 'Toulouse',
        country: 'France',
        phone: '+33 7 11 22 33 44',
      },
    },
    notes: 'Commande entreprise - 5 T-shirts',
    created_at: '2026-01-24T16:00:00.000Z',
    updated_at: '2026-01-25T09:00:00.000Z',
  },
  {
    id: 'order-5',
    order_number: 'CMD-B3JKZXIX',
    status: 'pending_payment',
    source: 'manual',
    customer_name: 'Julie Petit',
    customer_email: 'julie.petit@email.fr',
    customer_phone: '+33 6 55 66 77 88',
    customer_type: 'partner',
    subtotal: 60.0,
    discount_total: 15.0,
    shipping_cost: 5.0,
    total: 50.0,
    payment_status: 'pending',
    shipping: {
      cost: 5.0,
      address: {
        name: 'Julie Petit',
        address_line1: '23 rue de la Liberté',
        postal_code: '33000',
        city: 'Bordeaux',
        country: 'France',
        phone: '+33 6 55 66 77 88',
      },
    },
    notes: 'Tarif partenaire appliqué',
    internal_notes: 'Attendre confirmation paiement par virement',
    created_at: '2026-01-27T11:00:00.000Z',
    updated_at: '2026-01-27T11:00:00.000Z',
  },
  {
    id: 'order-6',
    order_number: 'CMD-B3JKZXIY',
    status: 'paid',
    source: 'online_shop',
    customer_name: 'Pierre Dubois',
    customer_email: 'pierre.dubois@email.fr',
    customer_phone: '+33 6 99 88 77 66',
    customer_type: 'individual',
    subtotal: 35.0,
    discount_total: 0,
    shipping_cost: 5.0,
    total: 40.0,
    payment_method: 'stripe',
    payment_status: 'paid',
    stripe_payment_id: 'pi_5555666677',
    paid_at: '2026-01-28T15:30:00.000Z',
    shipping: {
      cost: 5.0,
      address: {
        name: 'Pierre Dubois',
        address_line1: '67 avenue Victor Hugo',
        postal_code: '59000',
        city: 'Lille',
        country: 'France',
        phone: '+33 6 99 88 77 66',
      },
    },
    created_at: '2026-01-28T15:00:00.000Z',
    updated_at: '2026-01-28T15:30:00.000Z',
  },
];

// Lignes de commande démo
export const DEMO_ORDER_LINES: OrderLine[] = [
  // Order 1
  {
    id: 'line-1',
    order_id: 'order-1',
    product_id: 'product-1',
    variant_id: 'variant-2',
    product_name: 'T-shirt Boomkoeur Classic',
    variant_info: 'M - Noir',
    quantity: 2,
    unit_price: 25.0,
    discount_amount: 0,
    total: 50.0,
  },
  {
    id: 'line-2',
    order_id: 'order-1',
    product_id: 'product-1',
    variant_id: 'variant-3',
    product_name: 'T-shirt Boomkoeur Classic',
    variant_info: 'L - Noir',
    quantity: 1,
    unit_price: 25.0,
    discount_amount: 0,
    total: 25.0,
  },
  // Order 2
  {
    id: 'line-3',
    order_id: 'order-2',
    product_id: 'product-2',
    variant_id: 'variant-6',
    product_name: 'T-shirt Boomkoeur Festival',
    variant_info: 'M - Multicolore',
    quantity: 2,
    unit_price: 30.0,
    discount_amount: 5.0,
    total: 55.0,
  },
  // Order 3
  {
    id: 'line-4',
    order_id: 'order-3',
    product_id: 'product-3',
    variant_id: 'variant-9',
    product_name: 'Affiche Concert Jazz Night',
    variant_info: 'A3',
    quantity: 2,
    unit_price: 15.0,
    discount_amount: 0,
    total: 30.0,
  },
  {
    id: 'line-5',
    order_id: 'order-3',
    product_id: 'product-1',
    variant_id: 'variant-2',
    product_name: 'T-shirt Boomkoeur Classic',
    variant_info: 'M - Noir',
    quantity: 1,
    unit_price: 10.0,
    discount_amount: 0,
    total: 10.0,
    notes: 'Tarif événement',
  },
  // Order 4
  {
    id: 'line-6',
    order_id: 'order-4',
    product_id: 'product-1',
    variant_id: 'variant-2',
    product_name: 'T-shirt Boomkoeur Classic',
    variant_info: 'M - Noir',
    quantity: 3,
    unit_price: 25.0,
    discount_amount: 15.0,
    total: 60.0,
  },
  {
    id: 'line-7',
    order_id: 'order-4',
    product_id: 'product-1',
    variant_id: 'variant-3',
    product_name: 'T-shirt Boomkoeur Classic',
    variant_info: 'L - Noir',
    quantity: 2,
    unit_price: 25.0,
    discount_amount: 0,
    total: 50.0,
  },
  {
    id: 'line-8',
    order_id: 'order-4',
    product_id: 'product-4',
    variant_id: 'variant-10',
    product_name: 'Affiche Festival Électro',
    variant_info: 'A2',
    quantity: 2,
    unit_price: 20.0,
    discount_amount: 0,
    total: 40.0,
  },
  // Order 5
  {
    id: 'line-9',
    order_id: 'order-5',
    product_id: 'product-1',
    variant_id: 'variant-2',
    product_name: 'T-shirt Boomkoeur Classic',
    variant_info: 'M - Noir',
    quantity: 2,
    unit_price: 15.0,
    discount_amount: 10.0,
    total: 20.0,
    notes: 'Tarif partenaire',
  },
  {
    id: 'line-10',
    order_id: 'order-5',
    product_id: 'product-3',
    variant_id: 'variant-9',
    product_name: 'Affiche Concert Jazz Night',
    variant_info: 'A3',
    quantity: 3,
    unit_price: 10.0,
    discount_amount: 0,
    total: 30.0,
    notes: 'Tarif partenaire',
  },
  // Order 6
  {
    id: 'line-11',
    order_id: 'order-6',
    product_id: 'product-2',
    variant_id: 'variant-6',
    product_name: 'T-shirt Boomkoeur Festival',
    variant_info: 'M - Multicolore',
    quantity: 1,
    unit_price: 30.0,
    discount_amount: 0,
    total: 30.0,
  },
  {
    id: 'line-12',
    order_id: 'order-6',
    product_id: 'product-5',
    product_name: 'Porte-clés Logo Boomkoeur',
    quantity: 1,
    unit_price: 5.0,
    discount_amount: 0,
    total: 5.0,
  },
];

// Fonction d'initialisation
export function initializeOrdersDemoData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    
    // Si déjà initialisé avec cette version, ne rien faire
    if (currentVersion === DEMO_VERSION) {
      console.log('✅ [Orders Demo] Données déjà initialisées');
      return;
    }
    
    // Initialiser les commandes
    localStorage.setItem('orders', JSON.stringify(DEMO_ORDERS));
    
    // Initialiser les lignes de commande
    localStorage.setItem('order_lines', JSON.stringify(DEMO_ORDER_LINES));
    
    // Marquer comme initialisé
    localStorage.setItem(VERSION_KEY, DEMO_VERSION);
    
    console.log('✅ [Orders Demo] Données initialisées avec succès');
  } catch (error) {
    console.error('❌ [Orders Demo] Erreur lors de l\'initialisation:', error);
  }
}

// Fonction pour réinitialiser
export function resetOrdersDemoData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('orders');
    localStorage.removeItem('order_lines');
    localStorage.removeItem(VERSION_KEY);
    
    console.log('🔄 [Orders Demo] Données réinitialisées');
  } catch (error) {
    console.error('❌ [Orders Demo] Erreur lors de la réinitialisation:', error);
  }
}
