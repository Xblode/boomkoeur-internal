'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFilters, ProductType, ProductStatus } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import ProductCard from './ProductCard';
import CatalogSkeleton from './CatalogSkeleton';
import { Card, SectionHeader, SearchInput, FilterField, EmptyState } from '@/components/ui/molecules';
import { Button, Select, Checkbox, Label } from '@/components/ui/atoms';
import { Plus, Package } from 'lucide-react';

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  type: 'all',
  status: 'all',
  category: '',
  collection: '',
  event_id: '',
  low_stock: false,
};

interface CatalogTabProps {
  filters?: ProductFilters;
  onError?: (error: string | null) => void;
}

export default function CatalogTab({ filters: externalFilters, onError }: CatalogTabProps) {
  const router = useRouter();
  const { refreshTrigger, triggerRefresh } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(externalFilters || DEFAULT_FILTERS);

  // Sync with external filters when they change
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);
    }
  }, [externalFilters]);

  useEffect(() => {
    loadProducts();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [allProducts, filters]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productDataService.getProducts();
      setAllProducts(data);
      onError?.(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error loading products:', error);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
    }
    if (filters.type !== 'all') filtered = filtered.filter(p => p.type === filters.type);
    if (filters.status !== 'all') filtered = filtered.filter(p => p.status === filters.status);
    if (filters.low_stock) filtered = filtered.filter(p => p.total_stock < p.stock_threshold);
    setProducts(filtered);
  };

  const updateFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleProductClick = (product: Product) => {
    router.push(`/dashboard/products/${product.id}`);
  };

  const handleProductEdit = (product: Product) => {
    router.push(`/dashboard/products/${product.id}`);
  };

  const handleProductDelete = async (id: string) => {
    try {
      await productDataService.deleteProduct(id);
      triggerRefresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error deleting product:', error);
      onError?.(msg);
    }
  };

  return (
    <div className="w-full space-y-4">
      <SectionHeader
        icon={<Package size={28} />}
        title="Produits & Merch"
        subtitle="Gérez votre catalogue, stocks et variantes"
        actions={
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        }
        filters={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchInput
              label="Recherche"
              placeholder="Nom, SKU..."
              value={filters.search}
              onChange={(v) => updateFilter('search', v)}
            />
            <FilterField label="Type">
              <Select
                value={filters.type}
                onChange={e => updateFilter('type', e.target.value as ProductType | 'all')}
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'tshirt', label: 'T-shirts' },
                  { value: 'poster', label: 'Affiches' },
                  { value: 'keychain', label: 'Porte-clés' },
                  { value: 'fan', label: 'Éventails' },
                  { value: 'other', label: 'Autre' },
                ]}
              />
            </FilterField>
            <FilterField label="Statut">
              <Select
                value={filters.status}
                onChange={e => updateFilter('status', e.target.value as ProductStatus | 'all')}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  { value: 'idea', label: 'Idée' },
                  { value: 'in_production', label: 'En production' },
                  { value: 'available', label: 'Disponible' },
                  { value: 'out_of_stock', label: 'Rupture' },
                  { value: 'archived', label: 'Archivé' },
                ]}
              />
            </FilterField>
            <FilterField label="Stock">
              <Label className="flex items-center gap-2 cursor-pointer h-[38px]">
                <Checkbox
                  checked={filters.low_stock}
                  onChange={e => updateFilter('low_stock', e.target.checked)}
                />
                <span className="text-sm text-foreground">Stock faible uniquement</span>
              </Label>
            </FilterField>
          </div>
        }
      />

      {/* Compteur */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {products.length} produit{products.length > 1 ? 's' : ''}
        {products.length !== allProducts.length && ` sur ${allProducts.length}`}
      </div>

      {/* Grille produits */}
      {isLoading ? (
        <CatalogSkeleton count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit trouvé"
          description={
            allProducts.length === 0
              ? 'Créez votre premier produit pour commencer.'
              : 'Aucun produit ne correspond à vos filtres. Essayez de les ajuster.'
          }
          action={
            <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/products/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          }
          variant="full"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
              onEdit={handleProductEdit}
              onDelete={handleProductDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
