import { LayoutDashboard, Twitter, Linkedin, Github, CalendarDays, Wallet, Package, Users, ClipboardList } from 'lucide-react';

/**
 * Configuration de la navigation Frontend
 */
export const frontendNavigation = [
  {
    label: 'Accueil',
    href: '/',
  },
  {
    label: 'À propos',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

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
 * Configuration du footer
 */
export const footerLinks = [
  {
    label: 'Accueil',
    href: '/',
  },
  {
    label: 'À propos',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
  {
    label: 'Connexion',
    href: '/login',
  },
  {
    label: 'Inscription',
    href: '/register',
  },
  {
    label: 'Mentions légales',
    href: '/legal',
  },
];

export const footerSocialLinks = [
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: Github,
  },
];
