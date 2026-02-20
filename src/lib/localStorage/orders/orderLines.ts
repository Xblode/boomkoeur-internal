// localStorage operations for Order Lines
import { OrderLine, OrderLineInput } from '@/types/order';
import {
  getFromStorage,
  saveToStorage,
  generateId,
} from './storage';

const STORAGE_KEY = 'order_lines';

export function getOrderLines(): OrderLine[] {
  return getFromStorage<OrderLine[]>(STORAGE_KEY, []);
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
  saveToStorage(STORAGE_KEY, lines);
  
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
  saveToStorage(STORAGE_KEY, lines);
  
  return updatedLine;
}

export function removeOrderLine(id: string): void {
  const lines = getOrderLines();
  const filteredLines = lines.filter((l) => l.id !== id);
  saveToStorage(STORAGE_KEY, filteredLines);
}

export function removeOrderLinesByOrderId(orderId: string): void {
  const lines = getOrderLines();
  const filteredLines = lines.filter((l) => l.order_id !== orderId);
  saveToStorage(STORAGE_KEY, filteredLines);
}
