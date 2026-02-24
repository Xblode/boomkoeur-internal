/**
 * Service Products - Supabase
 * Remplace lib/localStorage/products pour le module Products
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import { safePadStart } from '@/lib/utils/safePadStart';
import type {
  Product,
  ProductInput,
  ProductVariant,
  ProductVariantInput,
  StockMovement,
  StockMovementInput,
  ProductProvider,
  ProductComment,
  ProductFilters,
  ProductType,
} from '@/types/product';

const SKU_PREFIXES: Record<ProductType, string> = {
  tshirt: 'TSH',
  poster: 'AFF',
  keychain: 'PC',
  fan: 'EVT',
  other: 'AUT',
};

async function generateProductSKU(type: ProductType): Promise<string> {
  const prefix = SKU_PREFIXES[type];
  const { data } = await supabase
    .from('products')
    .select('sku')
    .eq('type', type);

  let maxNumber = 0;
  for (const row of data ?? []) {
    const parts = (row.sku as string).split('-');
    if (parts.length >= 2 && parts[0] === prefix) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNumber) maxNumber = num;
    }
  }
  return `${prefix}-${safePadStart(maxNumber + 1, 3, '0')}`;
}

async function generateVariantSKU(
  productSku: string,
  variantInfo?: { size?: string; color?: string; design?: string }
): Promise<string> {
  if (!variantInfo || (!variantInfo.size && !variantInfo.color && !variantInfo.design)) {
    return productSku;
  }
  const suffixes: string[] = [];
  if (variantInfo.size) suffixes.push(variantInfo.size);
  if (variantInfo.color) {
    suffixes.push(variantInfo.color.substring(0, 3).toUpperCase());
  }
  if (variantInfo.design) {
    suffixes.push(variantInfo.design.substring(0, 3).toUpperCase());
  }
  return suffixes.length > 0 ? `${productSku}-${suffixes.join('-')}` : productSku;
}

// --- Products ---

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabase.from('products').select('*');
  const orgId = getActiveOrgId();
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;

  let products = (data ?? []).map(mapDbProduct);

  if (filters) {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.sku.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s)
      );
    }
    if (filters.type && filters.type !== 'all') {
      products = products.filter((p) => p.type === filters.type);
    }
    if (filters.status && filters.status !== 'all') {
      products = products.filter((p) => p.status === filters.status);
    }
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters.collection) {
      products = products.filter((p) => p.collection === filters.collection);
    }
    if (filters.event_id) {
      products = products.filter((p) => p.event_id === filters.event_id);
    }
    if (filters.low_stock) {
      products = products.filter((p) => p.total_stock < p.stock_threshold);
    }
  }

  for (const p of products) {
    const [providers, comments] = await Promise.all([
      getProductProviders(p.id),
      getProductComments(p.id),
    ]);
    p.providers = providers;
    p.comments = comments;
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  const product = mapDbProduct(data);
  const [providers, comments] = await Promise.all([
    getProductProviders(id),
    getProductComments(id),
  ]);
  product.providers = providers;
  product.comments = comments;
  return product;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data: { user } } = await supabase.auth.getUser();
  const sku = await generateProductSKU(input.type);

  const prices = input.prices ?? { public: 0, member: 0, partner: 0 };

  const { data, error } = await supabase
    .from('products')
    .insert({
      sku,
      name: input.name,
      description: input.description ?? '',
      type: input.type,
      status: input.status,
      category: input.category ?? '',
      tags: JSON.stringify(input.tags ?? []),
      collection: input.collection ?? null,
      prices: JSON.stringify(prices),
      total_stock: 0,
      stock_threshold: input.stock_threshold ?? 0,
      event_id: input.event_id ?? null,
      main_image: input.main_image ?? null,
      created_by: user?.id ?? null,
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  const product = mapDbProduct(data);
  product.providers = [];
  product.comments = [];

  const providers = input.providers ?? [];
  for (const pp of providers) {
    await addProductProvider(product.id, pp);
  }
  product.providers = providers;
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const allowed = [
    'name', 'description', 'type', 'status', 'category', 'tags', 'collection',
    'prices', 'total_stock', 'stock_threshold', 'event_id', 'main_image',
  ];
  for (const k of allowed) {
    const v = (updates as Record<string, unknown>)[k];
    if (v === undefined) continue;
    if (k === 'tags' || k === 'prices') {
      payload[k] = JSON.stringify(v);
    } else {
      payload[k] = v;
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  const product = mapDbProduct(data);
  const [providers, comments] = await Promise.all([
    getProductProviders(id),
    getProductComments(id),
  ]);
  product.providers = providers;
  product.comments = comments;
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

function mapDbProduct(row: Record<string, unknown>): Product {
  const tags = row.tags;
  const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? JSON.parse(tags || '[]') : []);
  const prices = row.prices;
  const pricesObj =
    typeof prices === 'object' && prices !== null
      ? (prices as { public?: number; member?: number; partner?: number })
      : typeof prices === 'string'
        ? JSON.parse(prices || '{}')
        : { public: 0, member: 0, partner: 0 };

  return {
    id: row.id as string,
    sku: row.sku as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    type: row.type as Product['type'],
    status: row.status as Product['status'],
    category: (row.category as string) ?? '',
    tags: tagsArr as string[],
    collection: (row.collection as string) ?? undefined,
    prices: {
      public: Number(pricesObj.public ?? 0),
      member: Number(pricesObj.member ?? 0),
      partner: Number(pricesObj.partner ?? 0),
    },
    providers: [],
    total_stock: Number(row.total_stock ?? 0),
    stock_threshold: Number(row.stock_threshold ?? 0),
    event_id: (row.event_id as string) ?? undefined,
    main_image: (row.main_image as string) ?? undefined,
    comments: [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Variants ---

export async function getVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDbVariant);
}

export async function createVariant(input: ProductVariantInput): Promise<ProductVariant> {
  const { data: productData } = await supabase
    .from('products')
    .select('sku, type')
    .eq('id', input.product_id)
    .single();

  if (!productData) throw new Error(`Product ${input.product_id} not found`);

  const variantSku =
    input.sku ||
    (await generateVariantSKU(productData.sku as string, {
      size: input.size,
      color: input.color,
      design: input.design,
    }));

  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: input.product_id,
      sku: variantSku,
      size: input.size ?? null,
      color: input.color ?? null,
      design: input.design ?? null,
      stock: input.stock ?? 0,
      purchase_price: input.purchase_price ?? 0,
      images: JSON.stringify(input.images ?? []),
      available_for: JSON.stringify(input.available_for ?? []),
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  await updateProductTotalStock(input.product_id);
  return mapDbVariant(data);
}

export async function updateVariant(
  id: string,
  updates: Partial<ProductVariant>
): Promise<ProductVariant> {
  const { data: variant } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', id)
    .single();

  if (!variant) throw new Error(`Variant ${id} not found`);

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const allowed = ['sku', 'size', 'color', 'design', 'stock', 'purchase_price', 'images', 'available_for'];
  for (const k of allowed) {
    const v = (updates as Record<string, unknown>)[k];
    if (v === undefined) continue;
    if (k === 'images' || k === 'available_for') {
      payload[k] = JSON.stringify(v);
    } else {
      payload[k] = v;
    }
  }

  const { data, error } = await supabase
    .from('product_variants')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if ('stock' in updates) {
    await updateProductTotalStock(variant.product_id as string);
  }
  return mapDbVariant(data);
}

export async function deleteVariant(id: string): Promise<void> {
  const { data: variant } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw error;
  if (variant) {
    await updateProductTotalStock(variant.product_id as string);
  }
}

async function updateProductTotalStock(productId: string): Promise<void> {
  const { data: variants } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('product_id', productId);

  const total = (variants ?? []).reduce((sum, v) => sum + Number(v.stock ?? 0), 0);
  await supabase
    .from('products')
    .update({ total_stock: total, updated_at: new Date().toISOString() })
    .eq('id', productId);
}

function mapDbVariant(row: Record<string, unknown>): ProductVariant {
  const images = row.images;
  const imagesArr = Array.isArray(images) ? images : (typeof images === 'string' ? JSON.parse(images || '[]') : []);
  const availableFor = row.available_for;
  const availableForArr = Array.isArray(availableFor)
    ? availableFor
    : typeof availableFor === 'string'
      ? JSON.parse(availableFor || '[]')
      : [];

  return {
    id: row.id as string,
    product_id: row.product_id as string,
    sku: row.sku as string,
    size: (row.size as string) ?? undefined,
    color: (row.color as string) ?? undefined,
    design: (row.design as string) ?? undefined,
    stock: Number(row.stock ?? 0),
    purchase_price: Number(row.purchase_price ?? 0),
    images: imagesArr as string[],
    available_for: availableForArr.length > 0 ? (availableForArr as ProductVariant['available_for']) : undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Stock Movements ---

export async function getStockMovements(filters: {
  productId?: string;
  variantId?: string;
}): Promise<StockMovement[]> {
  let query = supabase
    .from('product_stock_movements')
    .select('*')
    .order('date', { ascending: false });

  if (filters.productId) query = query.eq('product_id', filters.productId);
  if (filters.variantId) query = query.eq('variant_id', filters.variantId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapDbStockMovement);
}

export async function addStockMovement(input: StockMovementInput): Promise<StockMovement> {
  const { data: variant } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', input.variant_id)
    .single();

  if (!variant) throw new Error(`Variant ${input.variant_id} not found`);

  const currentStock = Number(variant.stock ?? 0);
  const newStock =
    input.type === 'in'
      ? currentStock + input.quantity
      : Math.max(0, currentStock - input.quantity);

  const { data, error } = await supabase
    .from('product_stock_movements')
    .insert({
      product_id: input.product_id,
      variant_id: input.variant_id,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      reference: input.reference ?? null,
      notes: input.notes ?? null,
      date: typeof input.date === 'string' ? input.date : (input.date as Date).toISOString().slice(0, 10),
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('product_variants')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', input.variant_id);

  const { data: v } = await supabase
    .from('product_variants')
    .select('product_id')
    .eq('id', input.variant_id)
    .single();
  if (v) await updateProductTotalStock(v.product_id as string);

  return mapDbStockMovement(data);
}

function mapDbStockMovement(row: Record<string, unknown>): StockMovement {
  return {
    id: row.id as string,
    product_id: row.product_id as string,
    variant_id: row.variant_id as string,
    type: row.type as 'in' | 'out',
    quantity: Number(row.quantity),
    reason: row.reason as StockMovement['reason'],
    reference: (row.reference as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    date: row.date as string,
    created_at: row.created_at as string,
  };
}

// --- Product Providers ---

async function getProductProviders(productId: string): Promise<ProductProvider[]> {
  const { data, error } = await supabase
    .from('product_providers')
    .select('provider_id, role')
    .eq('product_id', productId);

  if (error) throw error;
  return (data ?? []).map((r) => ({
    provider_id: r.provider_id as string,
    role: (r.role as string) ?? '',
  }));
}

export async function addProductProvider(productId: string, entry: ProductProvider): Promise<void> {
  const { error } = await supabase.from('product_providers').upsert(
    {
      product_id: productId,
      provider_id: entry.provider_id,
      role: entry.role ?? '',
    },
    { onConflict: 'product_id,provider_id' }
  );
  if (error) throw error;
}

export async function removeProductProvider(productId: string, providerId: string): Promise<void> {
  const { error } = await supabase
    .from('product_providers')
    .delete()
    .eq('product_id', productId)
    .eq('provider_id', providerId);
  if (error) throw error;
}

// --- Product Comments ---

async function getProductComments(productId: string): Promise<ProductComment[]> {
  const { data, error } = await supabase
    .from('product_comments')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    author: r.author as string,
    content: r.content as string,
    createdAt: r.created_at as string,
  }));
}

export async function addProductComment(
  productId: string,
  author: string,
  content: string
): Promise<ProductComment> {
  const { data, error } = await supabase
    .from('product_comments')
    .insert({
      product_id: productId,
      author,
      content,
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id as string,
    author: data.author as string,
    content: data.content as string,
    createdAt: data.created_at as string,
  };
}

// --- Low Stock ---

export async function getLowStockProducts(): Promise<Product[]> {
  let query = supabase.from('products').select('*');
  const orgId = getActiveOrgId();
  if (orgId) query = query.eq('org_id', orgId);
  const { data, error } = await query;

  if (error) throw error;

  const products = (data ?? []).map(mapDbProduct);
  const filtered = products.filter((p) => p.total_stock < p.stock_threshold);

  for (const p of filtered) {
    const [providers, comments] = await Promise.all([
      getProductProviders(p.id),
      getProductComments(p.id),
    ]);
    p.providers = providers;
    p.comments = comments;
  }
  return filtered;
}
