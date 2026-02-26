/**
 * Configuration des layouts du dashboard.
 * Centralise la détection des pages "detail" qui ont leur propre layout (sidebar + contenu).
 */

/** Préfixes des routes considérées comme pages détail (avec layout propre) */
const DETAIL_PAGE_PREFIXES = [
  '/dashboard/events/', // EventDetailLayout
  '/dashboard/meetings/', // MeetingDetailLayout
  '/dashboard/finance',
  '/dashboard/commercial',
  '/dashboard/docs',
  '/dashboard/products',
  '/dashboard/admin',
  '/dashboard/settings',
  '/dashboard/profile',
  '/dashboard/calendar',
] as const;

/**
 * Indique si le pathname correspond à une page détail (avec layout propre).
 * Ces pages ont leur propre sidebar et masquent la toolbar principale.
 */
export function isDetailPage(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return DETAIL_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Routes qui utilisent DashboardShell (config via providers) au lieu du layout legacy */
const DASHBOARD_SHELL_PREFIXES = [
  '/dashboard',
  '/dashboard/docs',
  '/dashboard/commercial',
  '/dashboard/finance',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/admin',
  '/dashboard/calendar',
  '/dashboard/events/',
  '/dashboard/meetings/',
  '/dashboard/products',
] as const;

/**
 * Indique si la page utilise DashboardShell (structure centralisée).
 * Toutes les pages dashboard passent par le shell sauf design-system et mode présentation.
 */
export function usesDashboardShell(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/dashboard/design-system')) return false;
  return DASHBOARD_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
