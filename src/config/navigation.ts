import { LayoutDashboard, CalendarDays, Wallet, Package, Users, ClipboardList } from 'lucide-react';

/**
 * Configuration de la navigation Frontend (header)
 */
export const frontendNavigation: Array<{ label: string; href: string }> = [];

/**
 * Configuration de la navigation Backend
 */
export const backendNavigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Events',
    href: '/dashboard/events',
    icon: CalendarDays,
  },
  {
    label: 'Réunions',
    href: '/dashboard/meetings',
    icon: ClipboardList,
  },
  {
    label: 'Finance',
    href: '/dashboard/finance',
    icon: Wallet,
  },
  {
    label: 'Produits',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    label: 'Commercial',
    href: '/dashboard/commercial',
    icon: Users,
  },
];

/**
 * Liens footer - invité (non connecté)
 */
export const footerLinksGuest = [
  { label: 'Accueil', href: '/' },
  { label: 'Contact', href: '/contact' },
  { label: 'Connexion', href: '/login' },
  { label: 'Inscription', href: '/register' },
  { label: 'Mentions légales', href: '/legal' },
];

/**
 * Liens footer - connecté
 */
export const footerLinksAuth = [
  { label: 'Accueil', href: '/' },
  { label: 'Contact', href: '/contact' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mentions légales', href: '/legal' },
];

/** @deprecated Utiliser footerLinksGuest ou footerLinksAuth selon le contexte */
export const footerLinks = footerLinksGuest;

/** Liens sociaux - données uniquement (icônes résolues côté client) */
export const footerSocialLinksData = [
  { label: 'Twitter', href: 'https://twitter.com', iconName: 'twitter' as const },
  { label: 'LinkedIn', href: 'https://linkedin.com', iconName: 'linkedin' as const },
  { label: 'GitHub', href: 'https://github.com', iconName: 'github' as const },
];

/** @deprecated Utiliser footerSocialLinksData - icônes non sérialisables Server→Client */
export const footerSocialLinks = footerSocialLinksData;
