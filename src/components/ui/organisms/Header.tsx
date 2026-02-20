'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { Button } from '../atoms/Button';
import { cn } from '@/lib/utils';
import { LogOut, User, Settings, Search, X, Calendar, Shield } from 'lucide-react';
import { Breadcrumb } from '../molecules/Breadcrumb';

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
  user = { name: 'Admin User', email: 'admin@example.com' }
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mode Admin (Dashboard)
  if (variant === 'admin') {
    return (
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[60px] border-b border-zinc-200 bg-white backdrop-blur-md dark:border-zinc-800 dark:bg-[#171717] flex",
        className
      )}>
        {/* Logo Area (60px width to match sidebar) */}
        <div className="w-[60px] min-w-[60px] h-full flex items-center justify-center border-r border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center justify-center" title="Retour à l'accueil">
            <Image src="/next.svg" alt="Logo" width={32} height={32} className="dark:invert" />
          </Link>
        </div>

        {/* Header Content */}
        <div className="flex-1 flex items-center justify-between px-4 sm:pl-6 sm:pr-4">
          {/* Breadcrumb (dynamique, basé sur src/config/navigation.ts) */}
          <Breadcrumb className="min-w-0" />

          <div className="flex items-center gap-2 sm:gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700/50 rounded-full transition-colors w-48 lg:w-64"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Rechercher...</span>
              <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ml-auto opacity-50">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <button
               onClick={() => setIsSearchOpen(true)}
               className="sm:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
               <Search size={18} />
            </button>

            {/* Calendar */}
            <Link
              href="/dashboard/calendar"
              className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors border border-zinc-200 dark:border-zinc-600"
              title="Calendrier"
            >
              <Calendar size={18} />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative flex items-center justify-center rounded-full transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                   {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                   ) : (
                     <User size={16} className="text-zinc-500" />
                   )}
                   <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-200" />
                </div>
              </button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-[#171717] z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
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
                      href="/dashboard/admin" 
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Shield size={16} />
                      Administratif
                    </Link>
                    <button 
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 mt-1"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Modal */}
        {isSearchOpen && mounted && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="fixed inset-x-4 top-[20%] z-[60] max-w-2xl mx-auto overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#171717] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
              <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input 
                  autoFocus
                  placeholder="Rechercher dans le site..."
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="py-6 text-center text-sm text-zinc-500">
                Aucun résultat trouvé.
              </div>
            </div>
          </>,
          document.body
        )}
      </header>
    );
  }

  // Mode Default (Frontend)
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Image src="/next.svg" alt="Logo" width={24} height={24} className="dark:invert" />
            <span>Template</span>
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

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
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
            <Button variant="ghost" size="sm" className="md:hidden">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
