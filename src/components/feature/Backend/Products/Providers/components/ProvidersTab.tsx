'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/atoms';
import { Provider } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/molecules/Card';

export default function ProvidersTab() {
  const { refreshTrigger } = useProduct();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [refreshTrigger]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await productDataService.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Fournisseurs</h2>
        <Button>
          <Plus size={20} className="mr-2" />
          Nouveau Fournisseur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className="hover:shadow-lg transition-shadow border-zinc-200 dark:border-zinc-800"
          >
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-foreground mb-3">
                {provider.name}
              </h3>
              
              {provider.contact_name && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Contact: {provider.contact_name}
                </p>
              )}
              
              {provider.email && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{provider.email}</p>
              )}
              
              {provider.phone && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{provider.phone}</p>
              )}
              
              {provider.address && (
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-3">{provider.address}</p>
              )}
              
              {provider.notes && (
                <p className="text-sm text-zinc-400 dark:text-zinc-600 mt-3 italic">
                  {provider.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
