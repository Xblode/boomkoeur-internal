/**
 * Google OAuth 2.0 - Génération et vérification du state
 * Le state contient org_id + nonce, signé avec le client_secret OAuth.
 * On utilise le MÊME secret que l'échange OAuth (org ou env) pour éviter les mismatches.
 */

import { createHmac, randomBytes } from 'crypto';

const STATE_SEPARATOR = '.';

function getFallbackSecret(): string {
  return (
    process.env.GOOGLE_CLIENT_SECRET ??
    process.env.INTEGRATIONS_ENCRYPTION_KEY ??
    'fallback'
  );
}

export interface OAuthState {
  org_id: string;
  nonce: string;
}

/** Crée le state signé avec le secret OAuth (client_secret de l'org ou env) */
export function createOAuthState(orgId: string, oauthSecret?: string | null): string {
  const secret = oauthSecret?.trim() || getFallbackSecret();
  const payload: OAuthState = {
    org_id: orgId,
    nonce: randomBytes(16).toString('hex'),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}${STATE_SEPARATOR}${signature}`;
}

/**
 * Décode le payload du state sans vérifier la signature (pour récupérer org_id).
 * À utiliser uniquement pour déterminer quel secret utiliser avant la vérification.
 */
function decodeStatePayload(state: string): OAuthState | null {
  if (!state || typeof state !== 'string') return null;
  let raw = state.trim();
  try {
    if (raw.includes('%')) raw = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const idx = raw.lastIndexOf(STATE_SEPARATOR);
  if (idx === -1) return null;
  const encoded = raw.slice(0, idx);
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OAuthState;
    if (!payload.org_id || !payload.nonce) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Vérifie le state. Passer oauthSecret (client_secret de l'org) pour utiliser le même
 * secret que lors de la création. Si non fourni, utilise les variables d'environnement.
 */
export function verifyAndParseOAuthState(
  state: string,
  oauthSecret?: string | null
): OAuthState | null {
  if (!state || typeof state !== 'string') return null;
  let raw = state.trim();
  try {
    if (raw.includes('%')) raw = decodeURIComponent(raw);
  } catch {
    /* garder raw tel quel */
  }
  const idx = raw.lastIndexOf(STATE_SEPARATOR);
  if (idx === -1) return null;
  const encoded = raw.slice(0, idx);
  const signature = raw.slice(idx + 1);

  const secret = oauthSecret?.trim() || getFallbackSecret();
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OAuthState;
    if (!payload.org_id || !payload.nonce) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Vérifie le state en utilisant le secret de l'org (récupéré via org_id dans le payload) */
export async function verifyAndParseOAuthStateWithOrgSecret(
  state: string,
  getSecretForOrg: (orgId: string) => Promise<string | null>
): Promise<OAuthState | null> {
  const payload = decodeStatePayload(state);
  if (!payload) return null;

  const orgSecret = await getSecretForOrg(payload.org_id);
  const secret = orgSecret?.trim() || getFallbackSecret();
  return verifyAndParseOAuthState(state, secret);
}
