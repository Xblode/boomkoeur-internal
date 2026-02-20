'use client';

import { ProductFilters } from '@/types/product';
import { Input, Select } from '@/components/ui/atoms';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules/Card';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export default function ProductFiltersComponent({
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
            />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type */}
          <Select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="tshirt">T-shirts</option>
            <option value="poster">Affiches</option>
            <option value="keychain">Porte-clés</option>
            <option value="fan">Éventails</option>
            <option value="other">Autre</option>
          </Select>

          {/* Status */}
          <Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="idea">Idée</option>
            <option value="in_production">En production</option>
            <option value="available">Disponible</option>
            <option value="out_of_stock">Rupture de stock</option>
            <option value="archived">Archivé</option>
          </Select>

          {/* Low Stock */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.low_stock}
              onChange={(e) => updateFilter('low_stock', e.target.checked)}
              className="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black dark:border-zinc-700"
            />
            <span className="text-sm text-foreground">Stock faible uniquement</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
