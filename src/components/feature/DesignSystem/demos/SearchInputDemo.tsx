'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { SearchInput } from '@/components/ui/molecules';

export const SearchInputDemo = () => {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">SearchInput</h3>
      <Card>
        <CardContent className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">
              Input de recherche avec icône Search pour les barres de filtres.
            </p>
            <SearchInput
              label="Recherche"
              placeholder="Rechercher..."
              value={value}
              onChange={setValue}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Sans label</p>
            <SearchInput
              placeholder="Nom, SKU..."
              value={value}
              onChange={setValue}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchInputDemo;
