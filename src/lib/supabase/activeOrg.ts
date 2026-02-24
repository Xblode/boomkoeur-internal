/**
 * Module partage pour l'org_id active.
 * Utilise par tous les services Supabase pour filtrer les donnees.
 */

let _activeOrgId: string | null = null;

export function setActiveOrgId(orgId: string | null) {
  _activeOrgId = orgId;
}

export function getActiveOrgId(): string | null {
  return _activeOrgId;
}

export function requireActiveOrgId(): string {
  if (!_activeOrgId) throw new Error('Aucune organisation active');
  return _activeOrgId;
}
