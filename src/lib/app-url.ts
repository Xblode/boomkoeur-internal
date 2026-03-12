import type { NextRequest } from 'next/server';

const FALLBACK_APP_URL = 'https://perret.app';

/**
 * Retourne l'URL de base de l'application.
 * Priorise l'origine de la requête (domaine réel) quand ce n'est pas localhost,
 * pour éviter les liens localhost en production.
 */
export function getAppUrl(request?: NextRequest | null): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = request?.nextUrl?.origin;

  if (origin && !origin.includes('localhost')) {
    return origin;
  }
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return envUrl ?? origin ?? FALLBACK_APP_URL;
}
