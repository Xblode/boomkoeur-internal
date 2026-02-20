// Types pour le module Produits/Merch

// Commentaire produit
export type ProductComment = {
  id: string;
  author: string;
  content: string;
  createdAt: Date | string;
};

// Type de produit
export type ProductType = 'tshirt' | 'poster' | 'keychain' | 'fan' | 'other';

// Statuts workflow
export type ProductStatus = 'idea' | 'in_production' | 'available' | 'out_of_stock' | 'archived';

// Types de disponibilité pour les variantes
export type VariantAvailability = 'public' | 'member' | 'partner';

// Variante de produit
export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string; // Auto-généré: TSH-001-M-BLK
  size?: string; // XS, S, M, L, XL, XXL
  color?: string; // Noir, Blanc, Rouge
  design?: string; // Collection/Design spécifique
  stock: number;
  purchase_price: number;
  images: string[]; // Images par variante
  available_for?: VariantAvailability[]; // Disponibilité: ['public', 'member', 'partner']. Si vide/undefined, disponible pour tous
  created_at: Date | string;
  updated_at: Date | string;
};

// Produit principal
export type Product = {
  id: string;
  sku: string; // Auto-généré: TSH-001, AFF-002
  name: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  
  // Catégorisation complète
  category: string; // Vêtements, Accessoires, Papeterie
  tags: string[]; // Bio, Édition limitée, Noir
  collection?: string; // Collection Été 2026, Collection Artist X
  
  // Prix multiples
  prices: {
    public: number;
    member: number; // Adhérent
    partner: number; // Partenaire
  };
  
  // Fournisseurs (multiple, chacun avec un rôle)
  providers: ProductProvider[];
  
  // Stock & Alertes
  total_stock: number; // Calculé depuis variantes
  stock_threshold: number; // Seuil d'alerte (ex: 10)
  
  // Événements
  event_id?: string; // Produit lié à un événement
  
  // Média
  main_image?: string;

  // Commentaires
  comments: ProductComment[];
  
  created_at: Date | string;
  updated_at: Date | string;
};

// Lien produit ↔ fournisseur avec rôle
export type ProductProvider = {
  provider_id: string;
  role: string; // Ex: "Matière première", "Impression", "Broderie"
};

// Fournisseur
export type Provider = {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: Date | string;
  updated_at: Date | string;
};

// Mouvement de stock
export type StockMovement = {
  id: string;
  product_id: string;
  variant_id: string;
  type: 'in' | 'out'; // Entrée/Sortie
  quantity: number;
  reason: 'purchase' | 'sale' | 'return' | 'loss' | 'adjustment';
  reference?: string; // Référence commande/facture
  notes?: string;
  date: Date | string;
  created_at: Date | string;
};

// Filtres
export type ProductFilters = {
  search: string;
  type: ProductType | 'all';
  status: ProductStatus | 'all';
  category: string;
  collection: string;
  event_id: string;
  low_stock: boolean; // Filtre pour stock < seuil
};

// Inputs pour création (sans champs auto-générés)
export type ProductInput = Omit<Product, 'id' | 'sku' | 'total_stock' | 'created_at' | 'updated_at'> & {
  providers?: ProductProvider[];
};
export type ProductVariantInput = Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>;
export type ProviderInput = Omit<Provider, 'id' | 'created_at' | 'updated_at'>;
export type StockMovementInput = Omit<StockMovement, 'id' | 'created_at'>;
