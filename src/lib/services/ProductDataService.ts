// Product Data Service - Supabase backend
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

import {
  getProducts as supabaseGetProducts,
  getProductById as supabaseGetProductById,
  createProduct as supabaseCreateProduct,
  updateProduct as supabaseUpdateProduct,
  deleteProduct as supabaseDeleteProduct,
  getVariants as supabaseGetVariants,
  createVariant as supabaseCreateVariant,
  updateVariant as supabaseUpdateVariant,
  deleteVariant as supabaseDeleteVariant,
  getStockMovements as supabaseGetStockMovements,
  addStockMovement as supabaseAddStockMovement,
  getLowStockProducts as supabaseGetLowStockProducts,
  addProductProvider as supabaseAddProductProvider,
  removeProductProvider as supabaseRemoveProductProvider,
  addProductComment as supabaseAddProductComment,
} from '@/lib/supabase/products';
import {
  getCommercialContacts,
  getCommercialContactById,
  createCommercialContact,
  updateCommercialContact,
  deleteCommercialContact,
} from '@/lib/supabase/commercial';
import type { CommercialContact, CommercialContactInput } from '@/types/commercial';

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

/** Mappe ProviderInput vers CommercialContactInput (type: supplier) */
function providerInputToCommercial(input: ProviderInput): CommercialContactInput {
  return {
    type: 'supplier',
    status: 'active',
    name: input.name,
    contact_person: input.contact_name ?? undefined,
    email: input.email ?? undefined,
    phone: input.phone ?? undefined,
    linked_product_ids: [],
    linked_order_ids: [],
    linked_invoice_ids: [],
    tags: [],
    notes: input.notes ?? undefined,
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

// Implémentation Supabase
class SupabaseProductService implements IProductDataService {
  // Products
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return supabaseGetProducts(filters);
  }

  async getProductById(id: string): Promise<Product | null> {
    return supabaseGetProductById(id);
  }

  async createProduct(product: ProductInput): Promise<Product> {
    return supabaseCreateProduct(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return supabaseUpdateProduct(id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    return supabaseDeleteProduct(id);
  }

  // Variants
  async getVariants(productId: string): Promise<ProductVariant[]> {
    return supabaseGetVariants(productId);
  }

  async createVariant(variant: ProductVariantInput): Promise<ProductVariant> {
    return supabaseCreateVariant(variant);
  }

  async updateVariant(
    id: string,
    updates: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    return supabaseUpdateVariant(id, updates);
  }

  async deleteVariant(id: string): Promise<void> {
    return supabaseDeleteVariant(id);
  }

  // Stock
  async getStockMovements(filters: {
    productId?: string;
    variantId?: string;
  }): Promise<StockMovement[]> {
    return supabaseGetStockMovements(filters);
  }

  async addStockMovement(movement: StockMovementInput): Promise<StockMovement> {
    return supabaseAddStockMovement(movement);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return supabaseGetLowStockProducts();
  }

  // Providers : proviennent de Commercial (suppliers)
  async getProviders(): Promise<Provider[]> {
    const contacts = await getCommercialContacts();
    const suppliers = contacts.filter((c) => c.type === 'supplier');
    return suppliers.map(commercialSupplierToProvider);
  }

  async getProviderById(id: string): Promise<Provider | null> {
    const contact = await getCommercialContactById(id);
    if (contact && contact.type === 'supplier') {
      return commercialSupplierToProvider(contact);
    }
    return null;
  }

  async createProvider(provider: ProviderInput): Promise<Provider> {
    const input = providerInputToCommercial(provider);
    const contact = await createCommercialContact(input);
    return commercialSupplierToProvider(contact);
  }

  async updateProvider(
    id: string,
    updates: Partial<Provider>
  ): Promise<Provider> {
    const payload: Partial<CommercialContactInput> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.contact_name !== undefined) payload.contact_person = updates.contact_name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    const contact = await updateCommercialContact(id, payload);
    if (!contact) throw new Error(`Provider ${id} not found`);
    return commercialSupplierToProvider(contact);
  }

  async deleteProvider(id: string): Promise<void> {
    const ok = await deleteCommercialContact(id);
    if (!ok) throw new Error(`Failed to delete provider ${id}`);
  }

  // Product providers
  async addProductProvider(productId: string, entry: ProductProvider): Promise<void> {
    return supabaseAddProductProvider(productId, entry);
  }

  async removeProductProvider(productId: string, providerId: string): Promise<void> {
    return supabaseRemoveProductProvider(productId, providerId);
  }

  // Comments
  async addComment(productId: string, author: string, content: string): Promise<ProductComment> {
    return supabaseAddProductComment(productId, author, content);
  }
}

// Singleton export
export const productDataService: IProductDataService = new SupabaseProductService();
