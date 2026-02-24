/**
 * Client Supabase pour le navigateur (Client Components).
 * Utilise createBrowserClient de @supabase/ssr pour la gestion des cookies/session.
 * La persistance de session dépend de la préférence "Enregistrer le mot de passe".
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getRememberMe } from '@/lib/auth-storage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)'
  );
}

function getCookieMaxAge(): number {
  if (typeof window === 'undefined') return 400 * 24 * 60 * 60; // default
  return getRememberMe() ? 400 * 24 * 60 * 60 : 24 * 60 * 60; // 400 jours vs 24h
}

let _client: SupabaseClient | null = null;

/** Réinitialise le client (à appeler avant signIn quand la préférence "remember me" change) */
export function resetSupabaseClient(): void {
  _client = null;
}

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient(supabaseUrl!, supabaseAnonKey!, {
      isSingleton: false,
      cookieOptions: {
        maxAge: getCookieMaxAge(),
      },
    });
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as unknown as Record<string, unknown>)[prop as string];
  },
});

export function createClient() {
  return getClient();
}
