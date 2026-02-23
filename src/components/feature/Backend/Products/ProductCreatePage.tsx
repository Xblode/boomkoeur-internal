"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductInput, ProductType, ProductStatus, Provider, ProductProvider, ProductVariantInput, VariantAvailability } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { Button, Input, Label, Textarea, Select, IconButton, Checkbox } from '@/components/ui/atoms';
import { ArrowLeft, Plus, X, Truck } from 'lucide-react';

const PROVIDER_ROLE_SUGGESTIONS = [
  'Matière première', 'Impression', 'Broderie', 'Assemblage', 'Finition', 'Emballage', 'Autre',
];

type VariantRow = {
  id: string;
  size: string;
  color: string;
  purchasePrice: number;
  imageUrl: string;
  availableFor: VariantAvailability[];
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export function ProductCreatePage() {
  const router = useRouter();
  const { triggerRefresh } = useProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState('');
  const [generatedVariants, setGeneratedVariants] = useState<VariantRow[]>([]);

  const [formData, setFormData] = useState<Partial<ProductInput>>({
    name: '',
    description: '',
    type: 'tshirt',
    status: 'idea',
    category: '',
    collection: '',
    tags: [],
    prices: { public: 0, member: 0, partner: 0 },
    providers: [],
    stock_threshold: 10,
    main_image: '',
  });

  // State pour ajouter un fournisseur
  const [newProviderId, setNewProviderId] = useState('');
  const [newProviderRole, setNewProviderRole] = useState('');

  const handleAddProvider = () => {
    if (!newProviderId || !newProviderRole.trim()) return;
    const current = formData.providers || [];
    if (current.find((p: ProductProvider) => p.provider_id === newProviderId)) return;
    setFormData(prev => ({ ...prev, providers: [...(prev.providers || []), { provider_id: newProviderId, role: newProviderRole.trim() }] }));
    setNewProviderId('');
    setNewProviderRole('');
  };

  const handleRemoveProvider = (providerId: string) => {
    setFormData(prev => ({ ...prev, providers: (prev.providers || []).filter((p: ProductProvider) => p.provider_id !== providerId) }));
  };

  useEffect(() => {
    productDataService.getProviders().then(setProviders);
  }, []);

  const handleGenerateVariants = () => {
    const colors = customColors.split(',').map(c => c.trim()).filter(c => c !== '');
    const sizes = selectedSizes.length > 0 ? selectedSizes : ['Unique'];
    const finalColors = colors.length > 0 ? colors : ['Unique'];

    const newVariants: VariantRow[] = [];
    sizes.forEach(size => {
      finalColors.forEach(color => {
        newVariants.push({
          id: Math.random().toString(36).substr(2, 9),
          size: size === 'Unique' ? '' : size,
          color: color === 'Unique' ? '' : color,
          purchasePrice: 0,
          imageUrl: '',
          availableFor: ['public', 'member', 'partner'],
        });
      });
    });
    setGeneratedVariants(newVariants);
  };

  const removeVariant = (id: string) => {
    setGeneratedVariants(prev => prev.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, field: 'purchasePrice' | 'imageUrl', value: string | number) => {
    setGeneratedVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const toggleAvailability = (id: string, type: VariantAvailability) => {
    setGeneratedVariants(prev => prev.map(v => {
      if (v.id !== id) return v;
      const cur = v.availableFor || [];
      return { ...v, availableFor: cur.includes(type) ? cur.filter(t => t !== type) : [...cur, type] };
    }));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const updatePrice = (type: 'public' | 'member' | 'partner', value: string) => {
    setFormData(prev => ({ ...prev, prices: { ...prev.prices!, [type]: parseFloat(value) || 0 } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    setIsSubmitting(true);

    try {
      const productToCreate = {
        ...formData,
        prices: {
          public: Number(formData.prices?.public || 0),
          member: Number(formData.prices?.member || 0),
          partner: Number(formData.prices?.partner || 0),
        },
        stock_threshold: Number(formData.stock_threshold || 0),
      } as ProductInput;

      const createdProduct = await productDataService.createProduct(productToCreate);

      if (generatedVariants.length > 0) {
        for (const variant of generatedVariants) {
          const variantInput: ProductVariantInput = {
            product_id: createdProduct.id,
            size: variant.size,
            color: variant.color,
            stock: 0,
            purchase_price: Number(variant.purchasePrice),
            sku: '',
            images: variant.imageUrl ? [variant.imageUrl] : [],
            available_for: variant.availableFor.length > 0 ? variant.availableFor : undefined,
          };
          await productDataService.createVariant(variantInput);
        }
      } else {
        await productDataService.createVariant({
          product_id: createdProduct.id,
          size: '',
          color: '',
          stock: 0,
          purchase_price: 0,
          sku: '',
          images: [],
          available_for: undefined,
        });
      }

      triggerRefresh();
      router.push(`/dashboard/products/${createdProduct.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-backend">
      <div className="max-w-4xl mx-auto p-8 md:p-12">

        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/products')}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-foreground transition-colors mb-6 justify-start"
        >
          <ArrowLeft size={16} />
          Retour aux produits
        </Button>

        <h1 className="text-3xl font-bold mb-8">Nouveau Produit</h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Informations Générales */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Informations Générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Ex: T-shirt Boomkoeur 2026" />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })} options={[
                  { value: 'tshirt', label: 'T-shirt' },
                  { value: 'poster', label: 'Affiche' },
                  { value: 'keychain', label: 'Porte-clés' },
                  { value: 'fan', label: 'Éventail' },
                  { value: 'other', label: 'Autre' },
                ]} />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })} options={[
                  { value: 'idea', label: 'Idée' },
                  { value: 'in_production', label: 'En production' },
                  { value: 'available', label: 'Disponible' },
                  { value: 'out_of_stock', label: 'Rupture' },
                  { value: 'archived', label: 'Archivé' },
                ]} />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Vêtements" />
              </div>
              <div>
                <Label htmlFor="collection">Collection</Label>
                <Input id="collection" value={formData.collection} onChange={(e) => setFormData({ ...formData, collection: e.target.value })} placeholder="Ex: Été 2026" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description détaillée du produit..." rows={3} />
              </div>
            </div>
          </div>

          {/* Prix & Logistique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Tarification Vente (€)</h3>
              <div className="space-y-3">
                <div><Label htmlFor="price_public">Prix Public</Label><Input id="price_public" type="number" step="0.01" min="0" value={formData.prices?.public} onChange={(e) => updatePrice('public', e.target.value)} /></div>
                <div><Label htmlFor="price_member">Prix Adhérent</Label><Input id="price_member" type="number" step="0.01" min="0" value={formData.prices?.member} onChange={(e) => updatePrice('member', e.target.value)} /></div>
                <div><Label htmlFor="price_partner">Prix Partenaire</Label><Input id="price_partner" type="number" step="0.01" min="0" value={formData.prices?.partner} onChange={(e) => updatePrice('partner', e.target.value)} /></div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Logistique</h3>
              <div className="space-y-3">
                <div>
                  <Label>Fournisseurs</Label>
                  {(formData.providers || []).length > 0 && (
                    <div className="space-y-1.5 mb-2">
                      {(formData.providers || []).map(({ provider_id, role }: ProductProvider) => {
                        const p = providers.find(x => x.id === provider_id);
                        return (
                          <div key={provider_id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm">
                            <div className="flex items-center gap-2">
                              <Truck size={12} className="text-zinc-400" />
                              <span className="font-medium">{p?.name}</span>
                              <span className="text-xs text-zinc-400 border border-zinc-300 dark:border-zinc-600 px-1.5 py-0.5 rounded-full">{role}</span>
                            </div>
                            <IconButton
                              icon={<X size={12} className="text-zinc-400 hover:text-red-500" />}
                              ariaLabel="Retirer le fournisseur"
                              variant="ghost"
                              size="xs"
                              type="button"
                              onClick={() => handleRemoveProvider(provider_id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Select
                      value={newProviderId}
                      onChange={(e) => setNewProviderId(e.target.value)}
                      options={[
                        { value: '', label: 'Choisir un fournisseur...' },
                        ...providers
                          .filter(p => !(formData.providers || []).find((x: ProductProvider) => x.provider_id === p.id))
                          .map(p => ({ value: p.id, label: p.name })),
                      ]}
                      className="flex-1"
                    />
                    <Input
                      value={newProviderRole}
                      onChange={(e) => setNewProviderRole(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProvider(); } }}
                      placeholder="Rôle"
                      list="provider-roles-create"
                      className="w-32"
                    />
                    <datalist id="provider-roles-create">
                      {PROVIDER_ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
                    </datalist>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleAddProvider}
                      disabled={!newProviderId || !newProviderRole.trim()}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  {providers.length === 0 && (
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Créez d&apos;abord un fournisseur dans{' '}
                      <Link href="/dashboard/commercial" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Commercial
                      </Link>.
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="threshold">Seuil d&apos;alerte stock global</Label>
                  <Input id="threshold" type="number" min="0" value={formData.stock_threshold} onChange={(e) => setFormData({ ...formData, stock_threshold: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
          </div>

          {/* Variantes */}
          <div className="space-y-4 pt-4 border-t border-border-custom">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Gestion des Variantes</h3>

            {generatedVariants.length > 0 && (
              <div className="space-y-2">
                {generatedVariants.map((variant) => (
                  <div key={variant.id} className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Variante</Label>
                          <p className="font-medium text-sm">
                            {variant.size && variant.color ? `${variant.size} - ${variant.color}` : variant.size || variant.color || 'Standard'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Prix d&apos;achat (€)</Label>
                          <Input type="number" step="0.01" min="0" className="h-8" value={variant.purchasePrice} onChange={(e) => updateVariant(variant.id, 'purchasePrice', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Image URL</Label>
                          <Input className="h-8 text-xs" placeholder="https://..." value={variant.imageUrl} onChange={(e) => updateVariant(variant.id, 'imageUrl', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-2 block">Disponible pour :</Label>
                        <div className="flex gap-4">
                          {(['public', 'member', 'partner'] as VariantAvailability[]).map(type => (
                            <Label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox checked={variant.availableFor.includes(type)} onChange={() => toggleAvailability(variant.id, type)} className="rounded" />
                              {type === 'public' ? 'Public' : type === 'member' ? 'Membre' : 'Partenaire'}
                            </Label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(variant.id)} className="mt-5">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-zinc-200 border-dashed dark:border-zinc-800 p-4">
              <div>
                <Label className="mb-2 block">Tailles</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <Button key={size} type="button" variant={selectedSizes.includes(size) ? 'primary' : 'outline'} size="sm" onClick={() => toggleSize(size)} className={selectedSizes.includes(size) ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : ''}>
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="colors">Couleurs (séparées par des virgules)</Label>
                <Input id="colors" value={customColors} onChange={(e) => setCustomColors(e.target.value)} placeholder="Ex: Noir, Blanc, Rouge, Bleu Marine" fullWidth />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateVariants} className="w-full mt-3">
                <Plus className="h-4 w-4" />
                Générer les variantes
              </Button>
            </div>
          </div>

          {/* Média */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Visuel Principal</h3>
            <div>
              <Label htmlFor="image">URL de l&apos;image principale</Label>
              <Input id="image" value={formData.main_image} onChange={(e) => setFormData({ ...formData, main_image: e.target.value })} placeholder="https://..." />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <Button type="button" variant="outline" size="md" onClick={() => router.push('/dashboard/products')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting || !formData.name?.trim()}>
              {isSubmitting ? 'Création...' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
