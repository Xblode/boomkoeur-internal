'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { usePathname } from 'next/navigation';

export type ProductsSectionId = 'catalogue' | 'commandes' | 'statistiques';

const PRODUCTS_SECTIONS = [
  { id: 'catalogue' as const, label: 'Catalogue', icon: <Package size={16} />, href: '/dashboard/products' },
  { id: 'commandes' as const, label: 'Commandes', icon: <ShoppingCart size={16} />, slug: '/commandes' },
  { id: 'statistiques' as const, label: 'Statistiques', icon: <TrendingUp size={16} />, slug: '/statistiques' },
];

function getActiveSectionFromPath(pathname: string | null): ProductsSectionId {
  if (!pathname) return 'catalogue';
  if (pathname.endsWith('/commandes')) return 'commandes';
  if (pathname.endsWith('/statistiques')) return 'statistiques';
  return 'catalogue';
}

const ProductsLayoutContext = createContext<{ activeSection: ProductsSectionId } | undefined>(undefined);

export function useProductsLayout() {
  const context = useContext(ProductsLayoutContext);
  if (!context) throw new Error('useProductsLayout must be used within a ProductsLayoutConfig');
  return context;
}

export function ProductsLayoutConfig({ children }: { children: React.ReactNode }) {
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();
  const pathname = usePathname();
  const activeSection = getActiveSectionFromPath(pathname);

  useEffect(() => {
    setMaxWidth('6xl');
    setPageSidebarConfig({
      basePath: '/dashboard/products',
      sectionGroups: [
        { title: 'Produits & Merch', sections: PRODUCTS_SECTIONS },
      ],
      activeSectionId: activeSection,
      onSectionChange: () => {},
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, setPageSidebarConfig, setMaxWidth]);

  return (
    <ProductsLayoutContext.Provider value={{ activeSection }}>
      {children}
    </ProductsLayoutContext.Provider>
  );
}
