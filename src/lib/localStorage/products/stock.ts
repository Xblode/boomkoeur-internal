// localStorage operations for Stock Movements
import { StockMovement, StockMovementInput } from '@/types/product';
import {
  getFromStorage,
  saveToStorage,
  generateId,
} from './storage';
import { getVariantById, updateVariant } from './variants';

const STORAGE_KEY = 'stock_movements';

export function getStockMovements(): StockMovement[] {
  return getFromStorage<StockMovement[]>(STORAGE_KEY, []);
}

export function getStockMovementsByProductId(productId: string): StockMovement[] {
  const movements = getStockMovements();
  return movements.filter((m) => m.product_id === productId);
}

export function getStockMovementsByVariantId(variantId: string): StockMovement[] {
  const movements = getStockMovements();
  return movements.filter((m) => m.variant_id === variantId);
}

export function addStockMovement(input: StockMovementInput): StockMovement {
  const movements = getStockMovements();
  const variant = getVariantById(input.variant_id);
  
  if (!variant) {
    throw new Error(`Variant with id "${input.variant_id}" not found`);
  }
  
  const newMovement: StockMovement = {
    ...input,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  
  movements.push(newMovement);
  saveToStorage(STORAGE_KEY, movements);
  
  // Mettre à jour le stock de la variante
  const newStock = input.type === 'in' 
    ? variant.stock + input.quantity 
    : variant.stock - input.quantity;
  
  updateVariant(input.variant_id, { stock: Math.max(0, newStock) });
  
  return newMovement;
}

export function getStockMovementsByFilters(filters: {
  productId?: string;
  variantId?: string;
}): StockMovement[] {
  let movements = getStockMovements();
  
  if (filters.productId) {
    movements = movements.filter((m) => m.product_id === filters.productId);
  }
  
  if (filters.variantId) {
    movements = movements.filter((m) => m.variant_id === filters.variantId);
  }
  
  return movements.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Plus récent en premier
  });
}
