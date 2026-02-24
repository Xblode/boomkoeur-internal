/**
 * Gestion des rappels dans localStorage
 */

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  createdAt: Date;
}

const REMINDERS_STORAGE_KEY = 'boomkoeur_reminders';

export function getReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as any[]).map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  } catch {
    return [];
  }
}

export function createReminder(input: { title: string; date: string; time?: string }): Reminder {
  const reminders = getReminders();
  const reminder: Reminder = {
    id: `rem-${Date.now()}`,
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    createdAt: new Date(),
  };
  reminders.push(reminder);
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  return reminder;
}

export function deleteReminder(id: string): void {
  const reminders = getReminders().filter((r) => r.id !== id);
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

export function getRemindersByDate(date: string): Reminder[] {
  return getReminders().filter((r) => r.date === date);
}

/**
 * Vide tous les rappels du localStorage
 */
export function clearReminders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REMINDERS_STORAGE_KEY);
}
