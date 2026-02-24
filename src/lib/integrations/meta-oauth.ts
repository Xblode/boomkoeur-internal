/**
 * Instagram OAuth - Génération et vérification du state (CSRF).
 * Le state contient org_id + nonce, signé pour éviter la manipulation.
 * Utilise INSTA_CLIENT_SECRET (ou META_CLIENT_SECRET en fallback).
 */

import { createHmac, randomBytes } from 'crypto';

const STATE_SEPARATOR = '.';
const SECRET =
  process.env.INSTA_CLIENT_SECRET ??
  process.env.META_CLIENT_SECRET ??
  process.env.INTEGRATIONS_ENCRYPTION_KEY ??
  'fallback';

export interface OAuthState {
  org_id: string;
  nonce: string;
}

export function createMetaOAuthState(orgId: string): string {
  const payload: OAuthState = {
    org_id: orgId,
    nonce: randomBytes(16).toString('hex'),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', SECRET).update(encoded).digest('base64url');
  return `${encoded}${STATE_SEPARATOR}${signature}`;
}

export function verifyAndParseMetaOAuthState(state: string): OAuthState | null {
  const idx = state.lastIndexOf(STATE_SEPARATOR);
  if (idx === -1) return null;
  const encoded = state.slice(0, idx);
  const signature = state.slice(idx + 1);
  const expected = createHmac('sha256', SECRET).update(encoded).digest('base64url');
  if (signature !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OAuthState;
    if (!payload.org_id || !payload.nonce) return null;
    return payload;
  } catch {
    return null;
  }
}
