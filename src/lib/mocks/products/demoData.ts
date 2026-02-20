// Demo data for Products/Merch module
import {
  Product,
  ProductVariant,
  StockMovement,
  Provider,
} from '@/types/product';

const DEMO_VERSION = '1.0';
const VERSION_KEY = 'products_demo_version';

// Fournisseurs démo
export const DEMO_PROVIDERS: Provider[] = [
  {
    id: 'provider-1',
    name: 'Print Express',
    contact_name: 'Marie Dupont',
    email: 'contact@printexpress.fr',
    phone: '+33 1 23 45 67 89',
    address: '12 rue de la Liberté, 75001 Paris',
    notes: 'Fournisseur principal pour les T-shirts',
    created_at: '2025-01-15T10:00:00.000Z',
    updated_at: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'provider-2',
    name: 'Affiche Pro',
    contact_name: 'Jean Martin',
    email: 'jean@affichepro.fr',
    phone: '+33 1 98 76 54 32',
    address: '45 avenue des Arts, 69002 Lyon',
    notes: 'Spécialiste impression affiches haute qualité',
    created_at: '2025-01-20T14:30:00.000Z',
    updated_at: '2025-01-20T14:30:00.000Z',
  },
  {
    id: 'provider-3',
    name: 'Goodies & Co',
    contact_name: 'Sophie Bernard',
    email: 'contact@goodiesandco.fr',
    phone: '+33 4 56 78 90 12',
    address: '8 boulevard du Commerce, 31000 Toulouse',
    notes: 'Accessoires et goodies divers',
    created_at: '2025-02-01T09:00:00.000Z',
    updated_at: '2025-02-01T09:00:00.000Z',
  },
];

// Produits démo
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'product-1',
    sku: 'TSH-001',
    name: 'T-shirt Boomkoeur Classic',
    description: 'T-shirt 100% coton avec logo Boomkoeur brodé',
    type: 'tshirt',
    status: 'available',
    category: 'Vêtements',
    tags: ['Bio', 'Coton', 'Classic'],
    collection: 'Collection Été 2026',
    prices: {
      public: 25.0,
      member: 20.0,
      partner: 15.0,
    },
    providers: [
      { provider_id: 'provider-1', role: 'Matière première' },
      { provider_id: 'provider-2', role: 'Impression' },
    ],
    total_stock: 145,
    stock_threshold: 20,
    main_image: '/products/tshirt-classic.jpg',
    comments: [],
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'product-2',
    sku: 'TSH-002',
    name: 'T-shirt Boomkoeur Festival',
    description: 'T-shirt édition limitée avec design coloré',
    type: 'tshirt',
    status: 'available',
    category: 'Vêtements',
    tags: ['Édition limitée', 'Festival', 'Coloré'],
    collection: 'Collection Festival 2026',
    prices: {
      public: 30.0,
      member: 25.0,
      partner: 18.0,
    },
    providers: [
      { provider_id: 'provider-1', role: 'Matière première' },
      { provider_id: 'provider-2', role: 'Impression' },
    ],
    total_stock: 78,
    stock_threshold: 15,
    main_image: '/products/tshirt-festival.jpg',
    comments: [],
    created_at: '2026-01-15T14:30:00.000Z',
    updated_at: '2026-01-15T14:30:00.000Z',
  },
  {
    id: 'product-3',
    sku: 'AFF-001',
    name: 'Affiche Concert Jazz Night',
    description: 'Affiche A3 haute qualité sur papier recyclé',
    type: 'poster',
    status: 'available',
    category: 'Papeterie',
    tags: ['A3', 'Recyclé', 'Jazz'],
    prices: {
      public: 15.0,
      member: 12.0,
      partner: 10.0,
    },
    providers: [{ provider_id: 'provider-2', role: 'Impression' }],
    total_stock: 200,
    stock_threshold: 30,
    main_image: '/products/poster-jazz.jpg',
    event_id: 'event-jazz-2026',
    comments: [],
    created_at: '2026-01-20T09:00:00.000Z',
    updated_at: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'product-4',
    sku: 'AFF-002',
    name: 'Affiche Festival Électro',
    description: 'Affiche A2 avec design néon vibrant',
    type: 'poster',
    status: 'available',
    category: 'Papeterie',
    tags: ['A2', 'Néon', 'Électro'],
    prices: {
      public: 20.0,
      member: 16.0,
      partner: 12.0,
    },
    providers: [{ provider_id: 'provider-2', role: 'Impression' }],
    total_stock: 150,
    stock_threshold: 25,
    main_image: '/products/poster-electro.jpg',
    comments: [],
    created_at: '2026-01-25T11:00:00.000Z',
    updated_at: '2026-01-25T11:00:00.000Z',
  },
  {
    id: 'product-5',
    sku: 'PC-001',
    name: 'Porte-clés Logo Boomkoeur',
    description: 'Porte-clés métal avec logo gravé',
    type: 'keychain',
    status: 'in_production',
    category: 'Accessoires',
    tags: ['Métal', 'Gravé'],
    prices: {
      public: 8.0,
      member: 6.0,
      partner: 5.0,
    },
    providers: [{ provider_id: 'provider-3', role: 'Fabricant' }],
    total_stock: 0,
    stock_threshold: 50,
    main_image: '/products/keychain.jpg',
    comments: [],
    created_at: '2026-01-28T15:00:00.000Z',
    updated_at: '2026-01-28T15:00:00.000Z',
  },
];

// Variantes démo
export const DEMO_VARIANTS: ProductVariant[] = [
  // T-shirt Classic - Variantes
  {
    id: 'variant-1',
    product_id: 'product-1',
    sku: 'TSH-001-S-NOI',
    size: 'S',
    color: 'Noir',
    stock: 25,
    purchase_price: 8.0,
    images: ['/products/tshirt-classic-s-noir.jpg'],
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'variant-2',
    product_id: 'product-1',
    sku: 'TSH-001-M-NOI',
    size: 'M',
    color: 'Noir',
    stock: 40,
    purchase_price: 8.0,
    images: ['/products/tshirt-classic-m-noir.jpg'],
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'variant-3',
    product_id: 'product-1',
    sku: 'TSH-001-L-NOI',
    size: 'L',
    color: 'Noir',
    stock: 35,
    purchase_price: 8.0,
    images: ['/products/tshirt-classic-l-noir.jpg'],
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'variant-4',
    product_id: 'product-1',
    sku: 'TSH-001-M-BLA',
    size: 'M',
    color: 'Blanc',
    stock: 30,
    purchase_price: 8.0,
    images: ['/products/tshirt-classic-m-blanc.jpg'],
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'variant-5',
    product_id: 'product-1',
    sku: 'TSH-001-L-BLA',
    size: 'L',
    color: 'Blanc',
    stock: 15,
    purchase_price: 8.0,
    images: ['/products/tshirt-classic-l-blanc.jpg'],
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-10T10:00:00.000Z',
  },
  // T-shirt Festival - Variantes
  {
    id: 'variant-6',
    product_id: 'product-2',
    sku: 'TSH-002-M-MUL',
    size: 'M',
    color: 'Multicolore',
    stock: 30,
    purchase_price: 10.0,
    images: ['/products/tshirt-festival-m.jpg'],
    created_at: '2026-01-15T14:30:00.000Z',
    updated_at: '2026-01-15T14:30:00.000Z',
  },
  {
    id: 'variant-7',
    product_id: 'product-2',
    sku: 'TSH-002-L-MUL',
    size: 'L',
    color: 'Multicolore',
    stock: 28,
    purchase_price: 10.0,
    images: ['/products/tshirt-festival-l.jpg'],
    created_at: '2026-01-15T14:30:00.000Z',
    updated_at: '2026-01-15T14:30:00.000Z',
  },
  {
    id: 'variant-8',
    product_id: 'product-2',
    sku: 'TSH-002-XL-MUL',
    size: 'XL',
    color: 'Multicolore',
    stock: 20,
    purchase_price: 10.0,
    images: ['/products/tshirt-festival-xl.jpg'],
    created_at: '2026-01-15T14:30:00.000Z',
    updated_at: '2026-01-15T14:30:00.000Z',
  },
  // Affiches - Variantes (par format)
  {
    id: 'variant-9',
    product_id: 'product-3',
    sku: 'AFF-001-A3',
    design: 'A3',
    stock: 200,
    purchase_price: 5.0,
    images: ['/products/poster-jazz-a3.jpg'],
    created_at: '2026-01-20T09:00:00.000Z',
    updated_at: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'variant-10',
    product_id: 'product-4',
    sku: 'AFF-002-A2',
    design: 'A2',
    stock: 150,
    purchase_price: 7.0,
    images: ['/products/poster-electro-a2.jpg'],
    created_at: '2026-01-25T11:00:00.000Z',
    updated_at: '2026-01-25T11:00:00.000Z',
  },
];

// Mouvements de stock démo
export const DEMO_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'movement-1',
    product_id: 'product-1',
    variant_id: 'variant-2',
    type: 'in',
    quantity: 50,
    reason: 'purchase',
    notes: 'Commande fournisseur Print Express',
    date: '2026-01-10T10:00:00.000Z',
    created_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'movement-2',
    product_id: 'product-1',
    variant_id: 'variant-2',
    type: 'out',
    quantity: 10,
    reason: 'sale',
    reference: 'CMD-2026-0001',
    notes: 'Vente en ligne',
    date: '2026-01-15T14:30:00.000Z',
    created_at: '2026-01-15T14:30:00.000Z',
  },
  {
    id: 'movement-3',
    product_id: 'product-3',
    variant_id: 'variant-9',
    type: 'in',
    quantity: 200,
    reason: 'purchase',
    notes: 'Commande Affiche Pro',
    date: '2026-01-20T09:00:00.000Z',
    created_at: '2026-01-20T09:00:00.000Z',
  },
];

// Fonction d'initialisation
export function initializeProductsDemoData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    
    // Si déjà initialisé avec cette version, ne rien faire
    if (currentVersion === DEMO_VERSION) {
      console.log('✅ [Products Demo] Données déjà initialisées');
      return;
    }
    
    // Initialiser les fournisseurs
    localStorage.setItem('providers', JSON.stringify(DEMO_PROVIDERS));
    
    // Initialiser les produits
    localStorage.setItem('products', JSON.stringify(DEMO_PRODUCTS));
    
    // Initialiser les variantes
    localStorage.setItem('product_variants', JSON.stringify(DEMO_VARIANTS));
    
    // Initialiser les mouvements de stock
    localStorage.setItem('stock_movements', JSON.stringify(DEMO_STOCK_MOVEMENTS));
    
    // Marquer comme initialisé
    localStorage.setItem(VERSION_KEY, DEMO_VERSION);
    
    console.log('✅ [Products Demo] Données initialisées avec succès');
  } catch (error) {
    console.error('❌ [Products Demo] Erreur lors de l\'initialisation:', error);
  }
}

// Fonction pour réinitialiser
export function resetProductsDemoData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('providers');
    localStorage.removeItem('products');
    localStorage.removeItem('product_variants');
    localStorage.removeItem('stock_movements');
    localStorage.removeItem(VERSION_KEY);
    
    console.log('🔄 [Products Demo] Données réinitialisées');
  } catch (error) {
    console.error('❌ [Products Demo] Erreur lors de la réinitialisation:', error);
  }
}
