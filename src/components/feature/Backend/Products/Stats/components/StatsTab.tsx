'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { Package, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, KPICard, SectionHeader } from '@/components/ui/molecules';

interface StatsTabProps {
  onError?: (error: string | null) => void;
}

export default function StatsTab({ onError }: StatsTabProps) {
  const { refreshTrigger } = useProduct();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await productDataService.getProducts();
      setProducts(data);
      onError?.(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error loading stats:', error);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.status === 'available').length;
  const totalStock = products.reduce((sum, p) => sum + p.total_stock, 0);
  const lowStockCount = products.filter(
    (p) => p.total_stock < p.stock_threshold
  ).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<TrendingUp size={28} />}
        title="Statistiques"
        subtitle="Vue d'ensemble de votre catalogue et stocks"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Produits" value={totalProducts} icon={Package} />
        <KPICard label="Produits Disponibles" value={availableProducts} icon={TrendingUp} />
        <KPICard label="Stock Total" value={totalStock} icon={Package} unit="unités" />
        <KPICard
          label="Alertes Stock"
          value={lowStockCount}
          icon={AlertCircle}
          subtext={lowStockCount > 0 ? 'Produits sous le seuil' : undefined}
        />
      </div>

      {/* Top Products */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Produits avec le plus de stock
        </h3>
        <Card variant="outline" className="overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-card-bg">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Prix Public
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card-bg divide-y divide-zinc-200 dark:divide-zinc-800">
              {products
                .sort((a, b) => b.total_stock - a.total_stock)
                .slice(0, 10)
                .map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-sm font-medium text-foreground">
                        {product.name}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {product.category}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-mono text-zinc-600 dark:text-zinc-400">
                      {product.sku}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-foreground">
                      {product.total_stock}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-foreground">
                      {product.prices.public.toFixed(2)}€
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
