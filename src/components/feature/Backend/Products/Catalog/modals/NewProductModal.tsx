'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Button, Input, Label, Textarea, Select } from '@/components/ui/atoms';
import { ProductInput, ProductType, ProductStatus, Provider, ProductVariantInput, VariantAvailability } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VariantRow = {
  id: string;
  size: string;
  color: string;
  purchasePrice: number;
  imageUrl: string;
  availableFor: VariantAvailability[];
};

export default function NewProductModal({ isOpen, onClose }: NewProductModalProps) {
  const { triggerRefresh } = useProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  // États pour les variantes
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
    prices: {
      public: 0,
      member: 0,
      partner: 0,
    },
    providers: [],
    stock_threshold: 10,
    main_image: '',
  });

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  useEffect(() => {
    if (isOpen) {
      loadProviders();
    }
  }, [isOpen]);

  const loadProviders = async () => {
    try {
      const data = await productDataService.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

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
          availableFor: ['public', 'member', 'partner'], // Par défaut, disponible pour tous
        });
      });
    });

    setGeneratedVariants(newVariants);
  };

  const removeVariant = (id: string) => {
    setGeneratedVariants(prev => prev.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, field: 'purchasePrice' | 'imageUrl', value: string | number) => {
    setGeneratedVariants(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const toggleAvailability = (id: string, type: VariantAvailability) => {
    setGeneratedVariants(prev => prev.map(v => {
      if (v.id === id) {
        const currentAvailability = v.availableFor || [];
        const newAvailability = currentAvailability.includes(type)
          ? currentAvailability.filter(t => t !== type)
          : [...currentAvailability, type];
        return { ...v, availableFor: newAvailability };
      }
      return v;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Créer le produit
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

      // 2. Créer les variantes
      if (generatedVariants.length > 0) {
        // Créer les variantes générées
        for (const variant of generatedVariants) {
          const variantInput: ProductVariantInput = {
            product_id: createdProduct.id,
            size: variant.size,
            color: variant.color,
            stock: 0, // Stock initial toujours 0, gestion via Mouvements
            purchase_price: Number(variant.purchasePrice),
            sku: '', 
            images: variant.imageUrl ? [variant.imageUrl] : [],
            available_for: variant.availableFor.length > 0 ? variant.availableFor : undefined,
          };
          await productDataService.createVariant(variantInput);
        }
      } else {
        // Créer une variante "Standard" par défaut si aucune variante n'est ajoutée
        const defaultVariant: ProductVariantInput = {
          product_id: createdProduct.id,
          size: '',
          color: '',
          stock: 0, // Stock initial 0
          purchase_price: 0,
          sku: '', 
          images: [],
          available_for: undefined, // Disponible pour tous par défaut
        };
        await productDataService.createVariant(defaultVariant);
      }

      triggerRefresh();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Erreur lors de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePrice = (type: 'public' | 'member' | 'partner', value: string) => {
    setFormData(prev => ({
      ...prev,
      prices: {
        ...prev.prices!,
        [type]: parseFloat(value) || 0
      }
    }));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Produit" size="lg" scrollable>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Informations Générales</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: T-shirt Boomkoeur 2026"
              />
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                options={[
                  { value: 'tshirt', label: 'T-shirt' },
                  { value: 'poster', label: 'Affiche' },
                  { value: 'keychain', label: 'Porte-clés' },
                  { value: 'fan', label: 'Éventail' },
                  { value: 'other', label: 'Autre' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                options={[
                  { value: 'idea', label: 'Idée' },
                  { value: 'in_production', label: 'En production' },
                  { value: 'available', label: 'Disponible' },
                  { value: 'out_of_stock', label: 'Rupture' },
                  { value: 'archived', label: 'Archivé' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Vêtements"
              />
            </div>

            <div>
              <Label htmlFor="collection">Collection</Label>
              <Input
                id="collection"
                value={formData.collection}
                onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                placeholder="Ex: Été 2026"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Prix & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tarification Vente (€)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="price_public">Prix Public</Label>
                <Input
                  id="price_public"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prices?.public}
                  onChange={(e) => updatePrice('public', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price_member">Prix Adhérent</Label>
                <Input
                  id="price_member"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prices?.member}
                  onChange={(e) => updatePrice('member', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price_partner">Prix Partenaire</Label>
                <Input
                  id="price_partner"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prices?.partner}
                  onChange={(e) => updatePrice('partner', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Logistique</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-400">La gestion des fournisseurs s&apos;effectue depuis la fiche produit.</p>
              </div>
              <div>
                <Label htmlFor="threshold">Seuil d'alerte stock global</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={formData.stock_threshold}
                  onChange={(e) => setFormData({ ...formData, stock_threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
              <p className="text-sm text-zinc-500 italic mt-2">
                Le stock initial sera de 0. Pour ajouter du stock, utilisez l'onglet "Stock" après la création.
              </p>
            </div>
          </div>
        </div>

        {/* Variantes */}
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gestion des Variantes</h3>

          {/* Liste des variantes ajoutées */}
          {generatedVariants.length > 0 && (
            <div className="space-y-2">
              {generatedVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs mb-1 block">Variante</Label>
                        <p className="font-medium text-sm">
                          {variant.size && variant.color
                            ? `${variant.size} - ${variant.color}`
                            : variant.size || variant.color || 'Standard'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Prix d'achat (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-8"
                          value={variant.purchasePrice}
                          onChange={(e) => updateVariant(variant.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Image URL (optionnel)</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="https://..."
                          value={variant.imageUrl}
                          onChange={(e) => updateVariant(variant.id, 'imageUrl', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Disponible pour :</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.availableFor.includes('public')}
                            onChange={() => toggleAvailability(variant.id, 'public')}
                            className="rounded"
                          />
                          Public
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.availableFor.includes('member')}
                            onChange={() => toggleAvailability(variant.id, 'member')}
                            className="rounded"
                          />
                          Membre
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.availableFor.includes('partner')}
                            onChange={() => toggleAvailability(variant.id, 'partner')}
                            className="rounded"
                          />
                          Partenaire
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                    className="mt-5"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire d'ajout de variante */}
          <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-zinc-200 border-dashed dark:border-zinc-800 p-4">
            <div>
              <Label className="mb-2 block">Tailles</Label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 rounded text-sm border transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="colors">Couleurs (séparées par des virgules)</Label>
              <Input
                id="colors"
                value={customColors}
                onChange={(e) => setCustomColors(e.target.value)}
                placeholder="Ex: Noir, Blanc, Rouge, Bleu Marine"
                fullWidth
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateVariants}
              className="w-full mt-3"
            >
              <Plus className="h-4 w-4" />
              Générer les variantes
            </Button>
          </div>
        </div>

        {/* Média */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Visuel Principal</h3>
          <div>
            <Label htmlFor="image">URL de l'image principale</Label>
            <Input
              id="image"
              value={formData.main_image}
              onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
      </form>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          type="button" 
          variant="primary" 
          size="sm" 
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Création...' : 'Créer le produit'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
