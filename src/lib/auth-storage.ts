/**
 * Préférence "Enregistrer le mot de passe" pour la persistance de session.
 * - true : session persistante (cookies longue durée, reste connecté)
 * - false : session courte (cookies 24h)
 */

const REMEMBER_ME_KEY = 'auth_remember_me';

export function getRememberMe(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
}

export function setRememberMe(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMEMBER_ME_KEY, String(value));
}
