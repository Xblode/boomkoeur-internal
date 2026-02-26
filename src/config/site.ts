import { Metadata } from 'next';

/**
 * Configuration générale du site
 */
import packageJson from '../../package.json';

export const siteConfig = {
  name: 'Perret',
  version: packageJson.version,
  title: 'Perret - Gestion d\'événements et de projets',
  description: 'Plateforme tout-en-un pour gérer vos événements, billetterie, finances, contacts et campagnes. Organisez, pilotez et communiquez en un seul endroit.',
  url: 'https://perret.app',
  ogImage: 'https://perret.app/og.jpg',
  links: {
    twitter: 'https://twitter.com',
    github: 'https://github.com',
  },
  keywords: ['événements', 'billetterie', 'gestion', 'finance', 'campagnes', 'organisation'],
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perret.app';

/**
 * Métadonnées par défaut
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: siteConfig.name,
  },
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@username',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
