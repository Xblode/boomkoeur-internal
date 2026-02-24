'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Product } from '@/types/product';
import { ProductDetailProvider, useProductDetail } from './ProductDetailProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import {
  AlignLeft,
  BarChart,
  Layers,
  ShoppingCart,
} from 'lucide-react';
import { productDataService } from '@/lib/services/ProductDataService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EntitySelectorDropdown } from '@/components/ui';
import { usePageSidebar } from '@/components/providers/PageSidebarProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { useChatPanel } from '@/components/providers/ChatPanelProvider';

type SectionId = 'info' | 'stock' | 'variantes' | 'commandes';

const SIDEBAR_SECTIONS = [
  { id: 'info' as const, label: 'Informations', icon: <AlignLeft size={16} />, slug: '' },
  { id: 'stock' as const, label: 'Stock', icon: <BarChart size={16} />, slug: '/stock' },
  { id: 'variantes' as const, label: 'Variantes', icon: <Layers size={16} />, slug: '/variantes' },
  { id: 'commandes' as const, label: 'Commandes', icon: <ShoppingCart size={16} />, slug: '/commandes' },
];

const STATUS_LABELS: Record<string, string> = {
  idea: 'Idée',
  in_production: 'En production',
  available: 'Disponible',
  out_of_stock: 'Rupture',
  archived: 'Archivé',
};

function getActiveSectionFromPath(pathname: string, basePath: string): SectionId {
  const relative = pathname.replace(basePath, '');
  if (relative === '/stock') return 'stock';
  if (relative === '/variantes') return 'variantes';
  if (relative === '/commandes') return 'commandes';
  return 'info';
}

function ProductDetailLayoutConfigInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { product, setProduct } = useProductDetail();
  const { setPageSidebarConfig } = usePageSidebar();
  const { setMaxWidth } = usePageLayout();
  const { setChatPanelConfig } = useChatPanel();

  const basePath = `/dashboard/products/${product.id}`;
  const activeSection = getActiveSectionFromPath(pathname ?? '', basePath);

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    productDataService.getProducts().then((products) => {
      setAllProducts(products.sort((a, b) => a.name.localeCompare(b.name)));
    });
  }, []);

  const handleSendComment = useCallback(
    async (author: string, content: string) => {
      await productDataService.addComment(product.id, author.trim(), content.trim());
      const updated = await productDataService.getProductById(product.id);
      if (updated) setProduct(updated);
    },
    [product.id, setProduct]
  );

  const productForSelector = allProducts.find((p) => p.id === product.id) ?? product;
  const comments = useMemo(() => product.comments ?? [], [product.comments]);

  useEffect(() => {
    setMaxWidth('5xl');
    setPageSidebarConfig({
      backLink: { href: '/dashboard/products', label: 'Retour aux produits' },
      entitySelector: (
        <EntitySelectorDropdown<Product>
          value={productForSelector}
          options={allProducts}
          onSelect={(p) => router.push(`/dashboard/products/${p.id}`)}
          renderValue={(p) => p.name}
          renderOption={(p) => (
            <>
              <span className="font-medium truncate block">{p.name}</span>
              <span className="text-xs text-zinc-400">{p.sku} · {STATUS_LABELS[p.status] || p.status}</span>
            </>
          )}
          placeholder="Sélectionner un produit"
        />
      ),
      sections: SIDEBAR_SECTIONS,
      activeSectionId: activeSection,
      basePath,
    });
    return () => setPageSidebarConfig(null);
  }, [activeSection, basePath, product, productForSelector, allProducts, router, setPageSidebarConfig, setMaxWidth]);

  useEffect(() => {
    setChatPanelConfig({
      comments,
      onSendComment: handleSendComment,
    });
    return () => setChatPanelConfig(null);
  }, [comments, handleSendComment, setChatPanelConfig]);

  return <>{children}</>;
}

interface ProductDetailLayoutConfigProps {
  productId: string;
  children: React.ReactNode;
}

export function ProductDetailLayoutConfig({ productId, children }: ProductDetailLayoutConfigProps) {
  const router = useRouter();
  const { setAlert } = useAlert();
  const [initialProduct, setInitialProduct] = useState<Product | null | undefined>(undefined);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    setDetailError(null);
    productDataService
      .getProductById(productId)
      .then((found) => {
        setInitialProduct(found ?? null);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        setDetailError(msg);
        setInitialProduct(null);
      });
  }, [productId]);

  const pageAlertMessage = detailError ? `Impossible de charger les données : ${detailError}` : null;

  useEffect(() => {
    if (pageAlertMessage) {
      setAlert({
        variant: 'error',
        message: pageAlertMessage,
        onDismiss: () => {
          setDetailError(null);
        },
      });
    } else {
      setAlert(null);
    }
    return () => setAlert(null);
  }, [pageAlertMessage, setAlert]);

  if (initialProduct === undefined && !detailError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  if (initialProduct === null && !detailError) {
    router.replace('/dashboard/products');
    return null;
  }

  if (initialProduct === null && detailError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Une erreur s&apos;est produite. Utilisez le bouton ci-dessus pour réessayer.</div>
      </div>
    );
  }

  return (
    <ProductDetailProvider key={productId} initialProduct={initialProduct!} onError={setDetailError}>
      <ProductDetailLayoutConfigInner>{children}</ProductDetailLayoutConfigInner>
    </ProductDetailProvider>
  );
}
