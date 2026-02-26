// localStorage operations for Order Lines
import { OrderLine, OrderLineInput } from '@/types/order';
import {
  getFromStorage,
  saveToStorage,
  generateId,
} from './storage';
import { getActiveOrgSlug } from '@/lib/supabase/activeOrg';

function getOrderLinesStorageKey(): string {
  return getActiveOrgSlug() === 'demo' ? 'order_lines_demo' : 'order_lines';
}

export function getOrderLines(): OrderLine[] {
  return getFromStorage<OrderLine[]>(getOrderLinesStorageKey(), []);
}

export function getOrderLinesByOrderId(orderId: string): OrderLine[] {
  const lines = getOrderLines();
  return lines.filter((l) => l.order_id === orderId);
}

export function getOrderLineById(id: string): OrderLine | null {
  const lines = getOrderLines();
  return lines.find((l) => l.id === id) || null;
}

export function addOrderLine(input: OrderLineInput): OrderLine {
  const lines = getOrderLines();
  
  const newLine: OrderLine = {
    ...input,
    id: generateId(),
  };
  
  lines.push(newLine);
  saveToStorage(getOrderLinesStorageKey(), lines);
  
  return newLine;
}

export function updateOrderLine(
  id: string,
  updates: Partial<OrderLine>
): OrderLine {
  const lines = getOrderLines();
  const index = lines.findIndex((l) => l.id === id);
  
  if (index === -1) {
    throw new Error(`OrderLine with id "${id}" not found`);
  }
  
  const updatedLine = {
    ...lines[index],
    ...updates,
  };
  
  lines[index] = updatedLine;
  saveToStorage(getOrderLinesStorageKey(), lines);
  
  return updatedLine;
}

export function removeOrderLine(id: string): void {
  const lines = getOrderLines();
  const filteredLines = lines.filter((l) => l.id !== id);
  saveToStorage(getOrderLinesStorageKey(), filteredLines);
}

export function removeOrderLinesByOrderId(orderId: string): void {
  const lines = getOrderLines();
  const filteredLines = lines.filter((l) => l.order_id !== orderId);
  saveToStorage(getOrderLinesStorageKey(), filteredLines);
}
