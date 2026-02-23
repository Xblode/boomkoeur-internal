'use client';

import { useState, useEffect } from 'react';
import { StockMovement, Product } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/molecules/Card';

export default function StockTab() {
  const { refreshTrigger } = useProduct();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [lowStock, allMovements, allProducts] = await Promise.all([
        productDataService.getLowStockProducts(),
        productDataService.getStockMovements({}),
        productDataService.getProducts(),
      ]);
      
      setLowStockProducts(lowStock);
      setMovements(allMovements.slice(0, 20)); // Derniers 20 mouvements
      
      // Create a map for quick access
      const map: Record<string, Product> = {};
      allProducts.forEach(p => {
        map[p.id] = p;
      });
      setProductsMap(map);

    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alertes Stock Faible */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 mb-3">
            <AlertCircle size={20} />
            <h3 className="font-semibold">
              {lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} en alerte stock
            </h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded border border-orange-100 dark:border-orange-900/30"
              >
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {product.total_stock} unités
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Seuil: {product.stock_threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derniers Mouvements */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Derniers mouvements
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-card-bg">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Raison
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-card-bg divide-y divide-zinc-200 dark:divide-zinc-800">
              {movements.map((movement) => {
                const product = productsMap[movement.product_id];
                return (
                  <tr key={movement.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-foreground">
                      {new Date(movement.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">{product ? product.name : 'Produit inconnu'}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {product ? product.sku : movement.product_id.substring(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {movement.type === 'in' ? (
                          <>
                            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Entrée
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                              Sortie
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-foreground">
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {movement.reason === 'sale' ? 'Vente' : 
                       movement.reason === 'purchase' ? 'Achat' : 
                       movement.reason === 'loss' ? 'Perte/Vol' : 
                       movement.reason === 'return' ? 'Retour' : 
                       movement.reason === 'adjustment' ? 'Ajustement' : 'Autre'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
