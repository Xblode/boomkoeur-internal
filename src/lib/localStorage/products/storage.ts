// Helper functions for localStorage operations - Products module
import { safePadStart } from '@/lib/utils/safePadStart';
import { ProductType } from '@/types/product';

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

export function updateInStorage<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T {
  const items = getFromStorage<T[]>(key, []);
  const index = items.findIndex((item) => item.id === id);
  
  if (index === -1) {
    throw new Error(`Item with id "${id}" not found in "${key}"`);
  }
  
  const updatedItem = {
    ...items[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  items[index] = updatedItem;
  saveToStorage(key, items);
  
  return updatedItem;
}

export function deleteFromStorage<T extends { id: string }>(
  key: string,
  id: string
): void {
  const items = getFromStorage<T[]>(key, []);
  const filteredItems = items.filter((item) => item.id !== id);
  saveToStorage(key, filteredItems);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Génération de SKU pour produits
const SKU_PREFIXES: Record<ProductType, string> = {
  tshirt: 'TSH',
  poster: 'AFF',
  keychain: 'PC',
  fan: 'EVT',
  other: 'AUT',
};

export function generateSKU(
  type: ProductType,
  variantInfo?: { size?: string; color?: string; design?: string }
): string {
  const prefix = SKU_PREFIXES[type];
  const key = 'products';
  const products = getFromStorage<any[]>(key, []);
  
  // Trouver le numéro max pour ce type
  const sameTypeProducts = products.filter((p) => p.type === type);
  const maxNumber = sameTypeProducts.reduce((max, p) => {
    if (p.sku) {
      const parts = p.sku.split('-');
      if (parts.length >= 2 && parts[0] === prefix) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > max) {
          return num;
        }
      }
    }
    return max;
  }, 0);
  
  const nextNumber = Math.max(0, maxNumber + 1);
  const baseSku = `${prefix}-${safePadStart(nextNumber, 3, '0')}`;
  
  // Si c'est une variante, ajouter les suffixes
  if (variantInfo) {
    const suffixes: string[] = [];
    if (variantInfo.size) suffixes.push(variantInfo.size);
    if (variantInfo.color) {
      // Abréger la couleur (3 premiers caractères en majuscules)
      suffixes.push(variantInfo.color.substring(0, 3).toUpperCase());
    }
    if (variantInfo.design) {
      // Abréger le design (3 premiers caractères en majuscules)
      suffixes.push(variantInfo.design.substring(0, 3).toUpperCase());
    }
    
    if (suffixes.length > 0) {
      return `${baseSku}-${suffixes.join('-')}`;
    }
  }
  
  return baseSku;
}
