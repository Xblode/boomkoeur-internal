// localStorage operations for Product Variants
import { ProductVariant, ProductVariantInput } from '@/types/product';
import {
  getFromStorage,
  saveToStorage,
  updateInStorage,
  deleteFromStorage,
  generateId,
  generateSKU,
} from './storage';
import { getProductById, updateTotalStock } from './products';

const STORAGE_KEY = 'product_variants';

export function getVariants(): ProductVariant[] {
  return getFromStorage<ProductVariant[]>(STORAGE_KEY, []);
}

export function getVariantsByProductId(productId: string): ProductVariant[] {
  const variants = getVariants();
  return variants.filter((v) => v.product_id === productId);
}

export function getVariantById(id: string): ProductVariant | null {
  const variants = getVariants();
  return variants.find((v) => v.id === id) || null;
}

export function createVariant(input: ProductVariantInput): ProductVariant {
  const variants = getVariants();
  const product = getProductById(input.product_id);
  
  if (!product) {
    throw new Error(`Product with id "${input.product_id}" not found`);
  }
  
  // Générer le SKU de la variante
  const variantSKU = input.sku || generateSKU(product.type, {
    size: input.size,
    color: input.color,
    design: input.design,
  });
  
  const newVariant: ProductVariant = {
    ...input,
    id: generateId(),
    sku: variantSKU,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  variants.push(newVariant);
  saveToStorage(STORAGE_KEY, variants);
  
  // Mettre à jour le stock total du produit
  updateProductTotalStock(input.product_id);
  
  return newVariant;
}

export function updateVariant(
  id: string,
  updates: Partial<ProductVariant>
): ProductVariant {
  const variant = getVariantById(id);
  if (!variant) {
    throw new Error(`Variant with id "${id}" not found`);
  }
  
  const updated = updateInStorage<ProductVariant>(STORAGE_KEY, id, updates);
  
  // Si le stock a changé, mettre à jour le total du produit
  if ('stock' in updates) {
    updateProductTotalStock(variant.product_id);
  }
  
  return updated;
}

export function deleteVariant(id: string): void {
  const variant = getVariantById(id);
  if (!variant) return;
  
  const productId = variant.product_id;
  deleteFromStorage<ProductVariant>(STORAGE_KEY, id);
  
  // Mettre à jour le stock total du produit
  updateProductTotalStock(productId);
}

function updateProductTotalStock(productId: string): void {
  const variants = getVariantsByProductId(productId);
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  updateTotalStock(productId, totalStock);
}
