// localStorage operations for Providers
import { Provider, ProviderInput } from '@/types/product';
import {
  getFromStorage,
  saveToStorage,
  updateInStorage,
  deleteFromStorage,
  generateId,
} from './storage';

const STORAGE_KEY = 'providers';

export function getProviders(): Provider[] {
  return getFromStorage<Provider[]>(STORAGE_KEY, []);
}

export function getProviderById(id: string): Provider | null {
  const providers = getProviders();
  return providers.find((p) => p.id === id) || null;
}

export function createProvider(input: ProviderInput): Provider {
  const providers = getProviders();
  
  const newProvider: Provider = {
    ...input,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  providers.push(newProvider);
  saveToStorage(STORAGE_KEY, providers);
  
  return newProvider;
}

export function updateProvider(
  id: string,
  updates: Partial<Provider>
): Provider {
  return updateInStorage<Provider>(STORAGE_KEY, id, updates);
}

export function deleteProvider(id: string): void {
  deleteFromStorage<Provider>(STORAGE_KEY, id);
}
