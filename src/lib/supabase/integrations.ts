/**
 * Service Intégrations - Supabase
 * Gestion des credentials d'intégration par organisation (chiffrés).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '@/lib/integrations/encryption';
import { createAdminClient } from './admin';
import { createHash, randomBytes } from 'crypto';

export type IntegrationProvider = 'shotgun' | 'meta' | 'google';

export interface ShotgunCredentials {
  organizerId: string;
  apiToken: string;
}

/** Credentials après OAuth (tokens stockés par org) */
export interface MetaCredentials {
  /** Instagram API with Instagram Login: token utilisateur Instagram */
  access_token?: string;
  /** Instagram API with Facebook Login: token de la Page Facebook */
  page_access_token?: string;
  page_id?: string;
  ig_user_id: string;
  /** Nom du compte Instagram (optionnel, pour affichage) */
  ig_username?: string;
}

export interface GoogleCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  email?: string;
}

export type IntegrationCredentials = ShotgunCredentials | MetaCredentials | GoogleCredentials;

export async function getOrgIntegration<T extends IntegrationCredentials>(
  supabase: SupabaseClient,
  orgId: string,
  provider: IntegrationProvider
): Promise<T | null> {
  const { data, error } = await supabase
    .from('organisation_integrations')
    .select('encrypted_credentials')
    .eq('org_id', orgId)
    .eq('provider', provider)
    .maybeSingle();

  if (error || !data?.encrypted_credentials) {
    return null;
  }

  try {
    const plain = await decrypt(data.encrypted_credentials);
    return JSON.parse(plain) as T;
  } catch {
    return null;
  }
}

export async function upsertOrgIntegration(
  supabase: SupabaseClient,
  orgId: string,
  provider: IntegrationProvider,
  credentials: IntegrationCredentials
): Promise<void> {
  const plain = JSON.stringify(credentials);
  const encrypted = await encrypt(plain);

  const { error } = await supabase.from('organisation_integrations').upsert(
    {
      org_id: orgId,
      provider,
      encrypted_credentials: encrypted,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'org_id,provider',
    }
  );

  if (error) throw error;
}

/**
 * Supprime une intégration pour une organisation.
 */
export async function deleteOrgIntegration(
  supabase: SupabaseClient,
  orgId: string,
  provider: IntegrationProvider
): Promise<void> {
  const { error } = await supabase
    .from('organisation_integrations')
    .delete()
    .eq('org_id', orgId)
    .eq('provider', provider);

  if (error) throw error;
}

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Résout org_id à partir d'une clé API.
 * Utilise le client admin (bypass RLS) car la requête n'a pas de session utilisateur.
 */
export async function getOrgIdFromApiKey(apiKey: string): Promise<string | null> {
  const keyHash = hashApiKey(apiKey);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('organisation_api_keys')
    .select('org_id')
    .eq('key_hash', keyHash)
    .maybeSingle();

  if (error || !data) return null;
  return data.org_id;
}

/**
 * Génère une nouvelle clé API et la stocke (hash).
 * Retourne la clé en clair (à afficher une seule fois).
 */
export async function createApiKey(
  supabase: SupabaseClient,
  orgId: string,
  name: string = 'Clé par défaut'
): Promise<{ key: string; id: string }> {
  const rawKey = `bk_${randomBytes(32).toString('base64url')}`;
  const keyHash = hashApiKey(rawKey);

  const { data, error } = await supabase
    .from('organisation_api_keys')
    .insert({ org_id: orgId, key_hash: keyHash, name })
    .select('id')
    .single();

  if (error) throw error;
  return { key: rawKey, id: data.id };
}
