'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFilters, ProductType, ProductStatus } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import ProductCard from './ProductCard';
import CatalogSkeleton from './CatalogSkeleton';
import { Card, SectionHeader, SearchInput, FilterField, EmptyState } from '@/components/ui/molecules';
import { Button, Select, Checkbox, Label, Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { Plus, Package, Tag, Activity, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const TYPE_OPTIONS = [
  { value: 'all' as const, label: 'Tous les types' },
  { value: 'tshirt' as ProductType, label: 'T-shirts' },
  { value: 'poster' as ProductType, label: 'Affiches' },
  { value: 'keychain' as ProductType, label: 'Porte-clés' },
  { value: 'fan' as ProductType, label: 'Éventails' },
  { value: 'other' as ProductType, label: 'Autre' },
];

const STATUS_OPTIONS = [
  { value: 'all' as const, label: 'Tous les statuts' },
  { value: 'idea' as ProductStatus, label: 'Idée' },
  { value: 'in_production' as ProductStatus, label: 'En production' },
  { value: 'available' as ProductStatus, label: 'Disponible' },
  { value: 'out_of_stock' as ProductStatus, label: 'Rupture' },
  { value: 'archived' as ProductStatus, label: 'Archivé' },
];

export default function CatalogTab({ filters: externalFilters, onError }: CatalogTabProps) {
  const router = useRouter();
  const { refreshTrigger, triggerRefresh } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(externalFilters || DEFAULT_FILTERS);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState<string | null>(null);

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
          <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:gap-4">
            {/* Recherche - pleine largeur sur mobile */}
            <div className="w-full min-w-0 md:col-span-1">
              <SearchInput
                label="Recherche"
                placeholder="Nom, SKU..."
                value={filters.search}
                onChange={(v) => updateFilter('search', v)}
              />
            </div>
            {/* Mobile: boutons filtres en ligne */}
            <div className="flex flex-wrap items-end gap-2 md:hidden">
              <Popover open={filterPopoverOpen === 'type'} onOpenChange={(o) => setFilterPopoverOpen(o ? 'type' : null)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    aria-label="Filtrer par type"
                  >
                    <Tag size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Type</div>
                  {TYPE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateFilter('type', opt.value);
                        setFilterPopoverOpen(null);
                      }}
                      className={cn(
                        'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                        filters.type === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover open={filterPopoverOpen === 'status'} onOpenChange={(o) => setFilterPopoverOpen(o ? 'status' : null)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    aria-label="Filtrer par statut"
                  >
                    <Activity size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Statut</div>
                  {STATUS_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateFilter('status', opt.value);
                        setFilterPopoverOpen(null);
                      }}
                      className={cn(
                        'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                        filters.status === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover open={filterPopoverOpen === 'stock'} onOpenChange={(o) => setFilterPopoverOpen(o ? 'stock' : null)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md border bg-transparent",
                      filters.low_stock
                        ? "border-zinc-400 dark:border-zinc-500 text-zinc-700 dark:text-zinc-300"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                    aria-label="Filtrer par stock"
                  >
                    <PackageCheck size={18} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="end">
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Stock</div>
                  <Label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <Checkbox
                      checked={filters.low_stock}
                      onChange={e => updateFilter('low_stock', e.target.checked)}
                    />
                    <span className="text-sm text-foreground">Stock faible uniquement</span>
                  </Label>
                </PopoverContent>
              </Popover>
            </div>
            {/* Type - desktop */}
            <div className="hidden md:block">
              <FilterField label="Type">
                <Select
                  value={filters.type}
                  onChange={e => updateFilter('type', e.target.value as ProductType | 'all')}
                  options={TYPE_OPTIONS}
                />
              </FilterField>
            </div>
            {/* Statut - desktop */}
            <div className="hidden md:block">
              <FilterField label="Statut">
                <Select
                  value={filters.status}
                  onChange={e => updateFilter('status', e.target.value as ProductStatus | 'all')}
                  options={STATUS_OPTIONS}
                />
              </FilterField>
            </div>
            {/* Stock - desktop */}
            <div className="hidden md:block">
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
