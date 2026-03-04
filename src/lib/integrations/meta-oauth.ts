/**
 * Instagram OAuth - Génération et vérification du state (CSRF).
 * Le state contient org_id + nonce, signé avec insta_client_secret.
 * Accepte un secret optionnel (config DB) ou fallback sur env.
 */

import { createHmac, randomBytes } from 'crypto';

const STATE_SEPARATOR = '.';

function getFallbackSecret(): string {
  return (
    process.env.INSTA_CLIENT_SECRET ??
    process.env.META_CLIENT_SECRET ??
    process.env.INTEGRATIONS_ENCRYPTION_KEY ??
    'fallback'
  );
}

export interface OAuthState {
  org_id: string;
  nonce: string;
}

/** Crée le state signé avec le secret OAuth (config org ou env) */
export function createMetaOAuthState(orgId: string, oauthSecret?: string | null): string {
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
 * À utiliser pour récupérer le secret de l'org avant la vérification.
 */
function decodeMetaStatePayload(state: string): OAuthState | null {
  if (!state || typeof state !== 'string') return null;
  const idx = state.lastIndexOf(STATE_SEPARATOR);
  if (idx === -1) return null;
  const encoded = state.slice(0, idx);
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OAuthState;
    if (!payload.org_id || !payload.nonce) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Vérifie le state. Passer oauthSecret (config org) pour utiliser le même secret que la création. */
export function verifyAndParseMetaOAuthState(
  state: string,
  oauthSecret?: string | null
): OAuthState | null {
  if (!state || typeof state !== 'string') return null;
  const idx = state.lastIndexOf(STATE_SEPARATOR);
  if (idx === -1) return null;
  const encoded = state.slice(0, idx);
  const signature = state.slice(idx + 1);
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
export async function verifyAndParseMetaOAuthStateWithOrgSecret(
  state: string,
  getSecretForOrg: (orgId: string) => Promise<string | null>
): Promise<OAuthState | null> {
  const payload = decodeMetaStatePayload(state);
  if (!payload) return null;

  const orgSecret = await getSecretForOrg(payload.org_id);
  const secret = orgSecret?.trim() || getFallbackSecret();
  return verifyAndParseMetaOAuthState(state, secret);
}
