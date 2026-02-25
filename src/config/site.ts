import { Metadata } from 'next';

/**
 * Configuration générale du site
 */
export const siteConfig = {
  name: 'Perret',
  title: 'Perret - Gestion d\'événements et de projets',
  description: 'Plateforme tout-en-un pour gérer vos événements, billetterie, finances, contacts et campagnes. Organisez, pilotez et communiquez en un seul endroit.',
  url: 'https://perret.fr',
  ogImage: 'https://perret.fr/og.jpg',
  links: {
    twitter: 'https://twitter.com',
    github: 'https://github.com',
  },
  keywords: ['événements', 'billetterie', 'gestion', 'finance', 'campagnes', 'organisation'],
};

/**
 * Métadonnées par défaut
 */
export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
