'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks';
import { footerLinksGuest, footerLinksAuth, footerSocialLinksData } from '@/config/navigation';
import { siteConfig } from '@/config/site';

const SOCIAL_ICONS = { twitter: Twitter, linkedin: Linkedin, github: Github } as const;

export interface FooterProps {
  links?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ label: string; href: string; iconName?: keyof typeof SOCIAL_ICONS }>;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  links: linksProp,
  socialLinks = footerSocialLinksData,
  className = '',
}) => {
  const { user } = useUser();
  const links = linksProp ?? (user ? footerLinksAuth : footerLinksGuest);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      "w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <Image
                src="/svg/logo.svg"
                alt="Logo"
                width={150}
                height={35}
                className="brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Plateforme tout-en-un pour gérer vos événements, billetterie, finances, contacts et campagnes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Liens</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Réseaux</h4>
            <ul className="space-y-3">
              {socialLinks.map((social) => {
                const Icon = social.iconName ? SOCIAL_ICONS[social.iconName] : null;
                return (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                    >
                      {Icon && <Icon size={16} />}
                      {social.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {currentYear} {siteConfig.name}. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
