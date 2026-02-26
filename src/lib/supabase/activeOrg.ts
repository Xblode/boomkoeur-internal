/**
 * Module partage pour l'org_id et slug actifs.
 * Utilise par tous les services Supabase pour filtrer les donnees.
 * Le slug 'demo' active le stockage démo pour les commandes (localStorage).
 */

let _activeOrgId: string | null = null;
let _activeOrgSlug: string | null = null;

export function setActiveOrgId(orgId: string | null) {
  _activeOrgId = orgId;
}

export function setActiveOrgSlug(slug: string | null) {
  _activeOrgSlug = slug;
}

export function getActiveOrgId(): string | null {
  return _activeOrgId;
}

export function getActiveOrgSlug(): string | null {
  return _activeOrgSlug;
}

export function isDemoOrg(): boolean {
  return _activeOrgSlug === 'demo';
}

export function requireActiveOrgId(): string {
  if (!_activeOrgId) throw new Error('Aucune organisation active');
  return _activeOrgId;
}
