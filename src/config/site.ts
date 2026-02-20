import { Metadata } from 'next';

/**
 * Configuration générale du site
 */
export const siteConfig = {
  name: 'Template V1',
  title: 'Template V1 - Next.js Starter',
  description: 'Un template Next.js moderne avec architecture Frontend/Backend',
  url: 'https://example.com',
  ogImage: 'https://example.com/og.jpg',
  links: {
    twitter: 'https://twitter.com',
    github: 'https://github.com',
  },
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
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
