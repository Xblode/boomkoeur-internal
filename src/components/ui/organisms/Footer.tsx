import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface FooterProps {
  links?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ label: string; href: string; icon?: any }>; // icon type any temporaire pour compatibilité
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  links = [],
  socialLinks = [],
  className = '',
}) => {
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
              <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-white" />
              <span>Template</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Une base solide pour vos projets Next.js. Design moderne, performance optimale et expérience développeur soignée.
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
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                  >
                    {social.icon && React.createElement(social.icon, { size: 16 })}
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {currentYear} Template Inc. Tous droits réservés.
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
