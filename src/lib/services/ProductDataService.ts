// Product Data Service - Interface abstraction for future Supabase migration
// Les fournisseurs assignables aux produits proviennent de Commercial (type: supplier)
import {
  Product,
  ProductInput,
  ProductVariant,
  ProductVariantInput,
  StockMovement,
  StockMovementInput,
  Provider,
  ProviderInput,
  ProductFilters,
  ProductComment,
  ProductProvider,
} from '@/types/product';

import * as productsStorage from '@/lib/localStorage/products/products';
import * as variantsStorage from '@/lib/localStorage/products/variants';
import * as stockStorage from '@/lib/localStorage/products/stock';
import * as providersStorage from '@/lib/localStorage/products/providers';
import { commercialService } from '@/lib/services/CommercialService';
import type { CommercialContact } from '@/types/commercial';

/** Mappe un contact Commercial (supplier) vers le format Provider */
function commercialSupplierToProvider(c: CommercialContact): Provider {
  const addr = c.address;
  const addressStr = addr
    ? [addr.street, addr.postal_code, addr.city, addr.country].filter(Boolean).join(', ')
    : undefined;
  return {
    id: c.id,
    name: c.name,
    contact_name: c.contact_person,
    email: c.email,
    phone: c.phone || c.mobile,
    address: addressStr,
    notes: c.notes,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

// Interface pour le service
export interface IProductDataService {
  // Products
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: ProductInput): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Variants
  getVariants(productId: string): Promise<ProductVariant[]>;
  createVariant(variant: ProductVariantInput): Promise<ProductVariant>;
  updateVariant(id: string, updates: Partial<ProductVariant>): Promise<ProductVariant>;
  deleteVariant(id: string): Promise<void>;
  
  // Stock
  getStockMovements(filters: { productId?: string; variantId?: string }): Promise<StockMovement[]>;
  addStockMovement(movement: StockMovementInput): Promise<StockMovement>;
  getLowStockProducts(): Promise<Product[]>;
  
  // Providers
  getProviders(): Promise<Provider[]>;
  getProviderById(id: string): Promise<Provider | null>;
  createProvider(provider: ProviderInput): Promise<Provider>;
  updateProvider(id: string, updates: Partial<Provider>): Promise<Provider>;
  deleteProvider(id: string): Promise<void>;

  // Product providers
  addProductProvider(productId: string, entry: ProductProvider): Promise<void>;
  removeProductProvider(productId: string, providerId: string): Promise<void>;

  // Comments
  addComment(productId: string, author: string, content: string): Promise<ProductComment>;
}

// Implementation avec localStorage
class LocalStorageProductService implements IProductDataService {
  // Products
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    if (filters) {
      return productsStorage.filterProducts(filters);
    }
    return productsStorage.getProducts();
  }

  async getProductById(id: string): Promise<Product | null> {
    return productsStorage.getProductById(id);
  }

  async createProduct(product: ProductInput): Promise<Product> {
    return productsStorage.createProduct(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return productsStorage.updateProduct(id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    productsStorage.deleteProduct(id);
  }

  // Variants
  async getVariants(productId: string): Promise<ProductVariant[]> {
    return variantsStorage.getVariantsByProductId(productId);
  }

  async createVariant(variant: ProductVariantInput): Promise<ProductVariant> {
    return variantsStorage.createVariant(variant);
  }

  async updateVariant(
    id: string,
    updates: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    return variantsStorage.updateVariant(id, updates);
  }

  async deleteVariant(id: string): Promise<void> {
    variantsStorage.deleteVariant(id);
  }

  // Stock
  async getStockMovements(filters: {
    productId?: string;
    variantId?: string;
  }): Promise<StockMovement[]> {
    return stockStorage.getStockMovementsByFilters(filters);
  }

  async addStockMovement(movement: StockMovementInput): Promise<StockMovement> {
    return stockStorage.addStockMovement(movement);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return productsStorage.getLowStockProducts();
  }

  // Providers : proviennent de Commercial (suppliers). Fallback sur l'ancien storage pour compatibilité.
  async getProviders(): Promise<Provider[]> {
    const contacts = await commercialService.getContacts();
    const suppliers = contacts.filter((c) => c.type === 'supplier');
    return suppliers.map(commercialSupplierToProvider);
  }

  async getProviderById(id: string): Promise<Provider | null> {
    const contacts = await commercialService.getContacts();
    const supplier = contacts.find((c) => c.type === 'supplier' && c.id === id);
    if (supplier) return commercialSupplierToProvider(supplier);
    return providersStorage.getProviderById(id);
  }

  async createProvider(provider: ProviderInput): Promise<Provider> {
    return providersStorage.createProvider(provider);
  }

  async updateProvider(
    id: string,
    updates: Partial<Provider>
  ): Promise<Provider> {
    return providersStorage.updateProvider(id, updates);
  }

  async deleteProvider(id: string): Promise<void> {
    providersStorage.deleteProvider(id);
  }

  // Product providers
  async addProductProvider(productId: string, entry: ProductProvider): Promise<void> {
    productsStorage.addProductProvider(productId, entry);
  }

  async removeProductProvider(productId: string, providerId: string): Promise<void> {
    productsStorage.removeProductProvider(productId, providerId);
  }

  // Comments
  async addComment(productId: string, author: string, content: string): Promise<ProductComment> {
    return productsStorage.addProductComment(productId, author, content);
  }
}

// Singleton export
export const productDataService: IProductDataService = new LocalStorageProductService();
