'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFilters, ProductType, ProductStatus } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import ProductCard from './ProductCard';
import CatalogSkeleton from './CatalogSkeleton';
import { Card } from '@/components/ui/molecules/Card';
import { Button, Input, Select } from '@/components/ui/atoms';
import { Plus, Search } from 'lucide-react';

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
}

export default function CatalogTab({ filters: externalFilters }: CatalogTabProps) {
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
    } catch (error) {
      console.error('Error loading products:', error);
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
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* Header — même mise en page que Events */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Produits & Merch</h1>
          <p className="text-muted-foreground">Gérez votre catalogue, stocks et variantes</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/products/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Filtres — grille 4 colonnes avec labels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Recherche</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
            <Input
              placeholder="Nom, SKU..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Type</label>
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
        </div>
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Statut</label>
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
        </div>
        <div>
          <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 block">Stock</label>
          <label className="flex items-center gap-2 cursor-pointer h-[38px]">
            <input
              type="checkbox"
              checked={filters.low_stock}
              onChange={e => updateFilter('low_stock', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="text-sm text-foreground">Stock faible uniquement</span>
          </label>
        </div>
      </div>

      {/* Compteur */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {products.length} produit{products.length > 1 ? 's' : ''}
        {products.length !== allProducts.length && ` sur ${allProducts.length}`}
      </div>

      {/* Grille produits */}
      {isLoading ? (
        <CatalogSkeleton count={8} />
      ) : products.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">Aucun produit trouvé</p>
        </Card>
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
