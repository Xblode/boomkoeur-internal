import { ShotgunEvent, ShotgunTicket } from '@/types/shotgun';

const EVENTS_CACHE_KEY = 'shotgun_events_cache';
const TICKETS_CACHE_PREFIX = 'shotgun_tickets_';
const EVENTS_TTL_MS = 5 * 60 * 1000;
const TICKETS_TTL_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function isCacheValid(key: string, ttl: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp < ttl;
  } catch {
    return false;
  }
}

export function getShotgunEventsCache(): ShotgunEvent[] | null {
  if (typeof window === 'undefined') return null;
  if (!isCacheValid(EVENTS_CACHE_KEY, EVENTS_TTL_MS)) return null;
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry<ShotgunEvent[]> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function setShotgunEventsCache(data: ShotgunEvent[]): void {
  if (typeof window === 'undefined') return;
  const entry: CacheEntry<ShotgunEvent[]> = { data, timestamp: Date.now() };
  localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(entry));
}

export function getShotgunTicketsCache(eventId: number): ShotgunTicket[] | null {
  if (typeof window === 'undefined') return null;
  const key = `${TICKETS_CACHE_PREFIX}${eventId}`;
  if (!isCacheValid(key, TICKETS_TTL_MS)) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<ShotgunTicket[]> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function setShotgunTicketsCache(eventId: number, data: ShotgunTicket[]): void {
  if (typeof window === 'undefined') return;
  const key = `${TICKETS_CACHE_PREFIX}${eventId}`;
  const entry: CacheEntry<ShotgunTicket[]> = { data, timestamp: Date.now() };
  localStorage.setItem(key, JSON.stringify(entry));
}

export function clearShotgunCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EVENTS_CACHE_KEY);
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(TICKETS_CACHE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
