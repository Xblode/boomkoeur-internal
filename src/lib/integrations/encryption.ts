/**
 * Chiffrement AES-256-GCM pour les credentials d'intégration.
 * Clé : INTEGRATIONS_ENCRYPTION_KEY (env) ou auto-générée et stockée en base (app_config).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const CONFIG_KEY = 'integrations_encryption_key';

async function getEncryptionKey(): Promise<Buffer> {
  let keyBase64 = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!keyBase64) {
    const admin = createAdminClient();
    const { data } = await admin.from('app_config').select('value').eq('key', CONFIG_KEY).maybeSingle();
    if (data?.value) {
      keyBase64 = data.value;
    } else {
      keyBase64 = randomBytes(KEY_LENGTH).toString('base64');
      await admin.from('app_config').upsert({ key: CONFIG_KEY, value: keyBase64, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
  }
  if (!keyBase64) {
    throw new Error('Encryption key not available');
  }
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== KEY_LENGTH) {
    throw new Error('INTEGRATIONS_ENCRYPTION_KEY must be 32 bytes (base64 encoded)');
  }
  return key;
}

/**
 * Chiffre une chaîne en AES-256-GCM.
 * Format: iv (16) + authTag (16) + ciphertext (base64)
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Déchiffre une chaîne chiffrée par encrypt().
 */
export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = Buffer.from(ciphertext, 'base64');
  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid ciphertext');
  }
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
