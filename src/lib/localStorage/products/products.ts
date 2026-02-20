// localStorage operations for Products
import {
  Product,
  ProductInput,
  ProductFilters,
  ProductType,
  ProductComment,
  ProductProvider,
} from '@/types/product';
import {
  getFromStorage,
  saveToStorage,
  updateInStorage,
  deleteFromStorage,
  generateId,
  generateSKU,
} from './storage';

const STORAGE_KEY = 'products';

export function getProducts(): Product[] {
  return getFromStorage<Product[]>(STORAGE_KEY, []);
}

export function getProductById(id: string): Product | null {
  const products = getProducts();
  return products.find((p) => p.id === id) || null;
}

export function getProductBySKU(sku: string): Product | null {
  const products = getProducts();
  return products.find((p) => p.sku === sku) || null;
}

export function createProduct(input: ProductInput): Product {
  const products = getProducts();
  
  const newProduct: Product = {
    ...input,
    id: generateId(),
    sku: generateSKU(input.type),
    total_stock: 0,
    providers: input.providers || [],
    comments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  products.push(newProduct);
  saveToStorage(STORAGE_KEY, products);
  
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product {
  return updateInStorage<Product>(STORAGE_KEY, id, updates);
}

export function deleteProduct(id: string): void {
  deleteFromStorage<Product>(STORAGE_KEY, id);
}

export function filterProducts(filters: ProductFilters): Product[] {
  let products = getProducts();
  
  // Search
  if (filters.search) {
    const search = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }
  
  // Type
  if (filters.type && filters.type !== 'all') {
    products = products.filter((p) => p.type === filters.type);
  }
  
  // Status
  if (filters.status && filters.status !== 'all') {
    products = products.filter((p) => p.status === filters.status);
  }
  
  // Category
  if (filters.category) {
    products = products.filter((p) => p.category === filters.category);
  }
  
  // Collection
  if (filters.collection) {
    products = products.filter((p) => p.collection === filters.collection);
  }
  
  // Event
  if (filters.event_id) {
    products = products.filter((p) => p.event_id === filters.event_id);
  }
  
  // Low stock
  if (filters.low_stock) {
    products = products.filter((p) => p.total_stock < p.stock_threshold);
  }
  
  return products;
}

export function updateTotalStock(productId: string, totalStock: number): void {
  updateProduct(productId, { total_stock: totalStock });
}

export function getLowStockProducts(): Product[] {
  const products = getProducts();
  return products.filter((p) => p.total_stock < p.stock_threshold);
}

export function addProductProvider(productId: string, entry: ProductProvider): void {
  const product = getProductById(productId);
  if (!product) throw new Error(`Product not found: ${productId}`);
  const providers = [...(product.providers || [])];
  if (!providers.find(p => p.provider_id === entry.provider_id)) {
    providers.push(entry);
    updateProduct(productId, { providers });
  }
}

export function removeProductProvider(productId: string, providerId: string): void {
  const product = getProductById(productId);
  if (!product) throw new Error(`Product not found: ${productId}`);
  updateProduct(productId, { providers: (product.providers || []).filter(p => p.provider_id !== providerId) });
}

export function addProductComment(productId: string, author: string, content: string): ProductComment {
  const product = getProductById(productId);
  if (!product) throw new Error(`Product not found: ${productId}`);

  const comment: ProductComment = {
    id: generateId(),
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  const comments = [...(product.comments || []), comment];
  updateProduct(productId, { comments });
  return comment;
}
