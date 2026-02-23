"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ProductStatus, ProductType, Provider, ProductProvider } from '@/types/product';
import { Button, Textarea, Popover, PopoverContent, PopoverTrigger, Input, Label, InlineEdit } from '@/components/ui/atoms';
import { TagMultiSelect, Card, CardContent } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import {
  Pencil,
  ChevronDown,
  AlignLeft,
  CircleDot,
  Package,
  Euro,
  Truck,
  Layers,
  Image as ImageIcon,
  FolderOpen,
  Bookmark,
  Plus,
  Search,
  Check,
} from 'lucide-react';

const PROVIDER_ROLE_SUGGESTIONS = [
  'Matière première',
  'Impression',
  'Broderie',
  'Assemblage',
  'Finition',
  'Emballage',
  'Autre',
];
import { useProductDetail } from './ProductDetailProvider';
import { productDataService } from '@/lib/services/ProductDataService';

const TYPE_LABELS: Record<ProductType, string> = {
  tshirt: 'T-shirt',
  poster: 'Affiche',
  keychain: 'Porte-clés',
  fan: 'Éventail',
  other: 'Autre',
};

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  idea:          { label: 'Idée',          className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' },
  in_production: { label: 'En production', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  available:     { label: 'Disponible',    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  out_of_stock:  { label: 'Rupture',       className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  archived:      { label: 'Archivé',       className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
};

export function ProductInfoSection() {
  const { product, persistField, variants } = useProductDetail();

  // Local editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState(product.name);
  const [descriptionValue, setDescriptionValue] = useState(product.description);
  const [categoryValue, setCategoryValue] = useState(product.category);
  const [collectionValue, setCollectionValue] = useState(product.collection || '');
  const [imageValue, setImageValue] = useState(product.main_image || '');

  // Providers (liste pour le picker) + résolution des assignés (ancien storage ou Commercial)
  const [providers, setProviders] = useState<Provider[]>([]);
  const [resolvedAssignedProviders, setResolvedAssignedProviders] = useState<Record<string, Provider>>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const collectionInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    productDataService.getProviders().then(setProviders);
  }, []);

  useEffect(() => {
    const ids = (product.providers || []).map((p) => p.provider_id);
    if (ids.length === 0) {
      setResolvedAssignedProviders({});
      return;
    }
    Promise.all(ids.map((id) => productDataService.getProviderById(id))).then((results) => {
      const map: Record<string, Provider> = {};
      ids.forEach((id, i) => {
        const p = results[i];
        if (p) map[id] = p;
      });
      setResolvedAssignedProviders(map);
    });
  }, [product.providers]);

  useEffect(() => {
    setNameValue(product.name);
    setDescriptionValue(product.description);
    setCategoryValue(product.category);
    setCollectionValue(product.collection || '');
    setImageValue(product.main_image || '');
  }, [product.name, product.description, product.category, product.collection, product.main_image]);

  // Name
  const saveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== product.name) persistField({ name: trimmed });
    else setNameValue(product.name);
    setEditingField(null);
  };
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') { setNameValue(product.name); setEditingField(null); }
  };

  // Category
  const saveCategory = () => {
    const trimmed = categoryValue.trim();
    if (trimmed !== product.category) persistField({ category: trimmed });
    setEditingField(null);
  };
  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveCategory();
    if (e.key === 'Escape') { setCategoryValue(product.category); setEditingField(null); }
  };

  // Collection
  const saveCollection = () => {
    const trimmed = collectionValue.trim();
    if (trimmed !== (product.collection || '')) persistField({ collection: trimmed || undefined });
    setEditingField(null);
  };
  const handleCollectionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveCollection();
    if (e.key === 'Escape') { setCollectionValue(product.collection || ''); setEditingField(null); }
  };

  // Image
  const saveImage = () => {
    const trimmed = imageValue.trim();
    if (trimmed !== (product.main_image || '')) persistField({ main_image: trimmed || undefined });
    setEditingField(null);
  };
  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveImage();
    if (e.key === 'Escape') { setImageValue(product.main_image || ''); setEditingField(null); }
  };

  // Status
  const handleStatusChange = (status: ProductStatus) => {
    persistField({ status });
  };

  // Type
  const handleTypeChange = (type: ProductType) => {
    persistField({ type });
  };

  // Provider picker (style MemberPicker)
  const [providerPickerOpen, setProviderPickerOpen] = useState(false);
  const [providerSearch, setProviderSearch] = useState('');
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  const handleProviderPickerOpen = (open: boolean) => {
    if (!open) { setProviderSearch(''); setPendingRoles({}); }
    setProviderPickerOpen(open);
  };

  const handleToggleProvider = (providerId: string) => {
    const current = product.providers || [];
    const existing = current.find(p => p.provider_id === providerId);
    if (existing) {
      persistField({ providers: current.filter(p => p.provider_id !== providerId) });
      setPendingRoles(prev => { const n = { ...prev }; delete n[providerId]; return n; });
    } else {
      persistField({ providers: [...current, { provider_id: providerId, role: pendingRoles[providerId] || '' }] });
    }
  };

  const handleUpdateProviderRole = (providerId: string, role: string) => {
    const current = product.providers || [];
    persistField({ providers: current.map(p => p.provider_id === providerId ? { ...p, role } : p) });
  };

  // Prices
  const handlePriceChange = (tier: 'public' | 'member' | 'partner', value: string) => {
    const num = parseFloat(value) || 0;
    persistField({ prices: { ...product.prices, [tier]: num } });
  };

  // Tags
  const handleTagsChange = (tags: string[]) => {
    persistField({ tags });
  };

  // Description
  const saveDescription = () => {
    const trimmed = descriptionValue.trim();
    if (trimmed !== product.description) persistField({ description: trimmed });
    setEditingField(null);
  };
  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDescriptionValue(product.description); setEditingField(null); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveDescription();
  };

  // Stock threshold
  const handleThresholdChange = (value: string) => {
    persistField({ stock_threshold: parseInt(value) || 0 });
  };

  return (
    <div className="space-y-8">

      {/* Header: title + metadata grid */}
      <div className="pb-6 border-b border-border-custom space-y-3">

        {/* Product image + title row */}
        <div className="flex items-start gap-6">
          {/* Thumbnail */}
          <div className="w-24 h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-border-custom">
            {product.main_image ? (
              <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={32} className="text-zinc-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Inline editable title */}
            <InlineEdit
              ref={nameInputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onFocus={() => setEditingField('name')}
              onBlur={saveName}
              onKeyDown={handleNameKeyDown}
              placeholder="Nom du produit"
              variant="title"
            />

            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-mono text-zinc-500">{product.sku}</span>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', STATUS_CONFIG[product.status].className)}>
                {STATUS_CONFIG[product.status].label}
              </span>
            </div>
          </div>
        </div>

        {/* 4-column metadata grid */}
        <div>
          <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: '120px 1fr 120px 1fr' }}>

            {/* Row 1: Type / Statut */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Package size={14} className="shrink-0" />
              <span>Type</span>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left text-sm h-auto font-normal">
                    <span className="font-medium">{TYPE_LABELS[product.type]}</span>
                    <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="flex flex-col gap-0.5">
                    {(Object.entries(TYPE_LABELS) as [ProductType, string][]).map(([key, label]) => (
                      <Button
                        key={key}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTypeChange(key)}
                        className={cn(
                          'flex items-center px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-left w-full justify-start font-normal',
                          product.type === key && 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CircleDot size={14} className="shrink-0" />
              <span>Statut</span>
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left h-auto font-normal">
                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', STATUS_CONFIG[product.status].className)}>
                      {STATUS_CONFIG[product.status].label}
                    </span>
                    <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="flex flex-col gap-0.5">
                    {(Object.keys(STATUS_CONFIG) as ProductStatus[]).map(s => (
                      <Button
                        key={s}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(s)}
                        className={cn(
                          'flex items-center px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full justify-start font-normal',
                          product.status === s && 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', STATUS_CONFIG[s].className)}>
                          {STATUS_CONFIG[s].label}
                        </span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Row 2: Catégorie / Collection */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <FolderOpen size={14} className="shrink-0" />
              <span>Catégorie</span>
            </div>
            <div>
              <InlineEdit
                ref={categoryInputRef}
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                onFocus={() => setEditingField('category')}
                onBlur={saveCategory}
                onKeyDown={handleCategoryKeyDown}
                placeholder="Catégorie"
                variant="default"
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Bookmark size={14} className="shrink-0" />
              <span>Collection</span>
            </div>
            <div>
              <InlineEdit
                ref={collectionInputRef}
                value={collectionValue}
                onChange={(e) => setCollectionValue(e.target.value)}
                onFocus={() => setEditingField('collection')}
                onBlur={saveCollection}
                onKeyDown={handleCollectionKeyDown}
                placeholder="Collection"
                variant="default"
                className="w-full"
              />
            </div>

            {/* Row 3: Fournisseurs / Stock total */}
            <div className="flex items-start gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Truck size={14} className="shrink-0 mt-0.5" />
              <span>Fournisseurs</span>
            </div>
            <div className="min-w-0">
              <Popover open={providerPickerOpen} onOpenChange={handleProviderPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="group flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors text-left text-sm min-h-[36px] h-auto font-normal">
                    {(() => {
                      const assigned = product.providers || [];
                      const displayable = assigned
                        .map(({ provider_id, role }) => {
                          const p = resolvedAssignedProviders[provider_id] ?? providers.find((x) => x.id === provider_id);
                          return p ? { provider: p, role } : null;
                        })
                        .filter(Boolean) as { provider: Provider; role: string }[];
                      const isEmpty = displayable.length === 0;
                      return isEmpty ? (
                        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 flex-1 min-w-0 italic">
                          <Plus size={12} className="shrink-0" />
                          <span>Vide</span>
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {displayable.map(({ provider: p, role }) => (
                            <span key={p.id} className="flex items-center gap-1">
                              <span className="font-medium">{p.name}</span>
                              {role && (
                                <span className="text-xs text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded-full">{role}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                    <ChevronDown size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="!w-72 !p-0" align="start" sideOffset={4}>
                  {/* Search */}
                  <div className="p-2 border-b border-border-custom">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <Search size={13} className="text-zinc-400 shrink-0" />
                      <Input
                        autoFocus
                        value={providerSearch}
                        onChange={e => setProviderSearch(e.target.value)}
                        placeholder="Rechercher un fournisseur..."
                        size="sm"
                        className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-auto py-1"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-64 overflow-y-auto py-1">
                    {providers
                      .filter(p => p.name.toLowerCase().includes(providerSearch.toLowerCase()))
                      .map(p => {
                        const assigned = (product.providers || []).find(x => x.provider_id === p.id);
                        return (
                          <div key={p.id}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleProvider(p.id)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left h-auto font-normal justify-start',
                                assigned && 'bg-zinc-50 dark:bg-zinc-800/60'
                              )}
                            >
                              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                                <Truck size={13} className="text-zinc-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.name}</p>
                                {p.contact_name && (
                                  <p className="text-xs text-zinc-400 truncate">{p.contact_name}</p>
                                )}
                              </div>
                              {assigned && <Check size={14} className="text-foreground shrink-0" />}
                            </Button>

                            {/* Role input for assigned provider */}
                            {assigned && (
                              <div className="px-3 pb-2">
                                <Input
                                  value={assigned.role}
                                  onChange={e => handleUpdateProviderRole(p.id, e.target.value)}
                                  placeholder="Rôle (ex: Impression, Matière première...)"
                                  list="provider-roles-picker"
                                  size="sm"
                                  className="w-full text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    }
                    {providers.filter(p => p.name.toLowerCase().includes(providerSearch.toLowerCase())).length === 0 && (
                      <div className="text-center py-4 px-3">
                        <p className="text-xs text-zinc-500 mb-2">
                          {providers.length === 0
                            ? 'Les fournisseurs doivent être créés dans Commercial.'
                            : 'Aucun fournisseur trouvé pour cette recherche.'}
                        </p>
                        {providers.length === 0 && (
                          <Link
                            href="/dashboard/commercial"
                            className="inline-flex items-center justify-center font-medium transition-all duration-200 text-xs px-3 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 border border-transparent"
                          >
                            Créer un fournisseur dans Commercial
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  <datalist id="provider-roles-picker">
                    {PROVIDER_ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
                  </datalist>

                  {(product.providers || []).length > 0 && (
                    <div className="p-2 border-t border-border-custom">
                      <p className="text-xs text-zinc-500 text-center">
                        {(product.providers || []).length} fournisseur{(product.providers || []).length > 1 ? 's' : ''} lié{(product.providers || []).length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-start gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Layers size={14} className="shrink-0 mt-0.5" />
              <span>Stock total</span>
            </div>
            <div className="flex items-start px-3 py-2 text-sm gap-2">
              <span className={cn(
                'font-semibold',
                product.total_stock < product.stock_threshold ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'
              )}>
                {product.total_stock} unités
              </span>
              <span className="text-zinc-400 text-xs">(seuil: {product.stock_threshold})</span>
            </div>

            {/* Row 4: Image URL */}
            <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
              <ImageIcon size={14} className="shrink-0" />
              <span>Image</span>
            </div>
            <div className="col-span-3">
              <InlineEdit
                ref={imageInputRef}
                value={imageValue}
                onChange={(e) => setImageValue(e.target.value)}
                onFocus={() => setEditingField('image')}
                onBlur={saveImage}
                onKeyDown={handleImageKeyDown}
                placeholder="URL de l'image"
                variant="default"
                className="w-full"
              />
            </div>

          </div>

          {/* Tags */}
          <div className="py-3">
            <TagMultiSelect
              value={product.tags}
              onChange={handleTagsChange}
              placeholder="Ajouter une étiquette..."
            />
          </div>

          {/* Prices section */}
          <Card variant="outline" className="mt-2 bg-zinc-50/50 dark:bg-zinc-900/30">
            <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Euro size={16} className="text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Tarification</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {([
                { key: 'public' as const, label: 'Public' },
                { key: 'member' as const, label: 'Adhérent' },
                { key: 'partner' as const, label: 'Partenaire' },
              ]).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-zinc-500 font-normal">{label}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.prices[key]}
                      onChange={(e) => handlePriceChange(key, e.target.value)}
                      fullWidth
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">€</span>
                  </div>
                </div>
              ))}
            </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-zinc-500" />
          Description
        </h2>
        <div
          className="space-y-2"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              saveDescription();
            }
          }}
        >
          <Textarea
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            rows={7}
            placeholder="Ajouter une description..."
            className="resize-none py-3 px-4"
          />
        </div>
      </div>

      {/* Variants summary */}
      {variants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Layers className="h-5 w-5 text-zinc-500" />
            Variantes ({variants.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {variants.slice(0, 8).map(v => (
              <Card key={v.id} variant="outline" className="bg-zinc-50/50 dark:bg-zinc-900/30">
                <CardContent className="p-3">
                <p className="text-sm font-medium">
                  {v.size && v.color ? `${v.size} · ${v.color}` : v.size || v.color || 'Standard'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Stock: <span className={cn('font-semibold', v.stock < 5 ? 'text-orange-500' : 'text-foreground')}>{v.stock}</span>
                </p>
                </CardContent>
              </Card>
            ))}
            {variants.length > 8 && (
              <div className="p-3 rounded-lg border border-dashed border-border-custom flex items-center justify-center">
                <span className="text-sm text-zinc-400">+{variants.length - 8} autres</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
