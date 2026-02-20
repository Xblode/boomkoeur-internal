"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import Link from 'next/link';

type SectionId = 'catalogue' | 'commandes' | 'statistiques';

interface SidebarSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  headerIcon: React.ReactNode;
  slug: string;
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: 'catalogue',    label: 'Catalogue',    icon: <Package size={16} />,      headerIcon: <Package size={28} />,      slug: '' },
  { id: 'commandes',    label: 'Commandes',    icon: <ShoppingCart size={16} />,  headerIcon: <ShoppingCart size={28} />,  slug: '/commandes' },
  { id: 'statistiques', label: 'Statistiques', icon: <TrendingUp size={16} />,   headerIcon: <TrendingUp size={28} />,   slug: '/statistiques' },
];

function getActiveSectionFromPath(pathname: string): SectionId {
  if (pathname.endsWith('/commandes')) return 'commandes';
  if (pathname.endsWith('/statistiques')) return 'statistiques';
  return 'catalogue';
}

interface ProductsOverviewLayoutProps {
  children: React.ReactNode;
}

export function ProductsOverviewLayout({ children }: ProductsOverviewLayoutProps) {
  const pathname = usePathname();
  const { toolbar } = useToolbar();

  const basePath = '/dashboard/products';
  const activeSection = getActiveSectionFromPath(pathname);
  const activeConfig = SIDEBAR_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="flex min-h-[calc(100vh-60px)]">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
        <div className="p-4 space-y-4">

          <div>
            <div className="mb-3 px-2">
              <h2 className="font-bold text-sm">Produits & Merch</h2>
            </div>

            <div className="space-y-0.5">
              {SIDEBAR_SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  href={`${basePath}${section.slug}`}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium"
                      : "text-zinc-500 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {toolbar && (
          <div className="sticky top-0 z-20 shrink-0">
            {toolbar}
          </div>
        )}

        <div className="flex-1 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">

            {activeSection !== 'catalogue' && activeConfig && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  {activeConfig.headerIcon}
                  {activeConfig.label}
                </h2>
              </div>
            )}

            {children}

          </div>
        </div>
      </main>
    </div>
  );
}
