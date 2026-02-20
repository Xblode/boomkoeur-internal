'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { Package, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules/Card';

export default function StatsTab() {
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
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const stats = [
    {
      label: 'Total Produits',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Produits Disponibles',
      value: availableProducts,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Stock Total',
      value: totalStock,
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Alertes Stock',
      value: lowStockCount,
      icon: AlertCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Statistiques</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-zinc-200 dark:border-zinc-800"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Produits avec le plus de stock
        </h3>
        <div className="bg-white dark:bg-[#1f1f1f] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-[#1f1f1f]">
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
            <tbody className="bg-white dark:bg-[#1f1f1f] divide-y divide-zinc-200 dark:divide-zinc-800">
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
        </div>
      </div>
    </div>
  );
}
