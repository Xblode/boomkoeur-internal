'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, IconButton } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { LogOut, User, Settings, Search, Calendar, Shield, Menu, X } from 'lucide-react';
import { Breadcrumb } from '../molecules/Breadcrumb';
import { GlobalSearchModal } from './GlobalSearchModal';
import { useMobileNav } from '@/components/providers/MobileNavProvider';
import { supabase } from '@/lib/supabase/client';
import { ROUTES } from '@/lib/constants';
import { useUser } from '@/hooks';
import { siteConfig } from '@/config/site';

export interface HeaderProps {
  navigation?: Array<{ label: string; href: string }>;
  className?: string;
  variant?: 'default' | 'admin';
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  navigation = [],
  className = '',
  variant = 'default',
  user: userProp,
}) => {
  const { user: sessionUser } = useUser();
  const user = userProp ?? (sessionUser
    ? { name: sessionUser.name, email: sessionUser.email, avatar: sessionUser.avatar }
    : { name: 'Utilisateur', email: '' });
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN);
    router.refresh();
  };

  const { toggle: toggleMobileNav } = useMobileNav();

  // Mode Admin (Dashboard)
  if (variant === 'admin') {
    return (
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[52px] border-b border-zinc-200 bg-white backdrop-blur-md dark:border-zinc-800 dark:bg-backend flex",
        className
      )}>
        {/* Logo / Hamburger Area — hamburger sur mobile, logo sur desktop */}
        <div className="w-[52px] min-w-[52px] h-full flex items-center justify-center border-r border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={toggleMobileNav}
            aria-label="Ouvrir le menu de navigation"
            className="lg:hidden p-2 -m-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Menu size={24} />
          </button>
          <Link
            href="/"
            className="hidden lg:flex items-center justify-center"
            title="Retour à l'accueil"
          >
            <Image
              src="/svg/Fichier 2.svg"
              alt="Logo"
              width={20}
              height={40}
              className="brightness-0 invert"
            />
          </Link>
        </div>

        {/* Header Content */}
        <div className="flex-1 flex items-center justify-between px-3">
          <div className="flex items-center min-w-0">
            <Breadcrumb variant="navigation" className="min-w-0" />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search — icône sur mobile, barre complète sur desktop */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Rechercher"
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700/50 rounded-full w-44 lg:w-56 border-0 h-8"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Rechercher...</span>
              <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ml-auto opacity-50">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <IconButton
              icon={Search}
              ariaLabel="Rechercher"
              variant="ghost"
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full h-auto w-auto"
            />

            {/* Calendrier */}
            <Link
              href="/dashboard/calendar"
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title="Calendrier"
            >
              <Calendar size={18} />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Menu utilisateur"
                aria-expanded={isUserMenuOpen}
                className="relative flex items-center justify-center rounded-full p-0 h-7 w-7 min-w-7 border-0"
              >
                <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative group">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                   ) : (
                     <User size={16} className="text-zinc-500" />
                   )}
                   <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-200" />
                </div>
              </Button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-backend z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <Link 
                      href="/dashboard/profile" 
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      Profil
                    </Link>
                    <Link 
                      href="/dashboard/settings" 
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} />
                      Paramètres
                    </Link>
                    <Link 
                      href="/dashboard/admin/general" 
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Shield size={16} />
                      Administratif
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 mt-1 justify-start h-auto border-0"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Modal */}
        {isSearchOpen && mounted && (
          <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        )}
      </header>
    );
  }

  // Mode Default (Frontend)
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 overflow-visible",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Image
              src="/svg/logo.svg"
              alt="Logo"
              width={120}
              height={34}
              className="brightness-0 invert"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Hamburger (mobile, à droite) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {sessionUser ? (
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                    S&apos;inscrire
                  </Button>
                </Link>
              </>
            )}
            <IconButton
              icon={Menu}
              ariaLabel="Ouvrir le menu"
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2"
            />
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer — à droite, z-index élevé, overflow visible */}
      {isMobileNavOpen && mounted && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed right-0 top-0 bottom-0 z-[9999] w-[min(280px,85vw)] border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex flex-col md:hidden overflow-visible shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <span className="font-semibold text-sm">Menu</span>
              <IconButton
                icon={X}
                ariaLabel="Fermer le menu"
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2 rounded-lg"
              />
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
                <span className="px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Connexion</span>
                {sessionUser ? (
                  <Link href={ROUTES.DASHBOARD} onClick={() => setIsMobileNavOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileNavOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileNavOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full">
                        S&apos;inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </aside>
        </>,
        document.body
      )}
    </header>
  );
};
