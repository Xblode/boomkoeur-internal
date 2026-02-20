'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Button, Input, Label, Textarea, Select } from '@/components/ui/atoms';
import { Product, ProductType, ProductStatus, Provider, ProductVariant, VariantAvailability } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const { triggerRefresh } = useProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  
  const [formData, setFormData] = useState<Product>(product);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [initialVariantIds, setInitialVariantIds] = useState<string[]>([]);
  
  // État pour la nouvelle variante
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    purchasePrice: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(product);
      loadProviders();
      loadVariants();
    }
  }, [isOpen, product]);

  const loadProviders = async () => {
    try {
      const data = await productDataService.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadVariants = async () => {
    try {
      const data = await productDataService.getVariants(product.id);
      setVariants(data);
      setInitialVariantIds(data.map(v => v.id));
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const handleVariantChange = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const handleVariantImageChange = (id: string, url: string) => {
    setVariants(prev => prev.map(v => 
      v.id === id ? { ...v, images: url ? [url] : [] } : v
    ));
  };

  const handleAddVariant = () => {
    const variant: ProductVariant = {
      id: `temp-${Date.now()}`, // ID temporaire
      product_id: product.id,
      sku: `${product.sku}-${Date.now()}`,
      size: newVariant.size,
      color: newVariant.color,
      stock: 0,
      purchase_price: parseFloat(newVariant.purchasePrice) || 0,
      images: newVariant.imageUrl ? [newVariant.imageUrl] : [],
      available_for: ['public', 'member', 'partner'], // Par défaut, disponible pour tous
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setVariants([...variants, variant]);
    setNewVariant({ size: '', color: '', purchasePrice: '', imageUrl: '' });
  };

  const toggleVariantAvailability = (id: string, type: VariantAvailability) => {
    setVariants(prev => prev.map(v => {
      if (v.id === id) {
        const currentAvailability = v.available_for || ['public', 'member', 'partner'];
        const newAvailability = currentAvailability.includes(type)
          ? currentAvailability.filter(t => t !== type)
          : [...currentAvailability, type];
        return { ...v, available_for: newAvailability };
      }
      return v;
    }));
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Mise à jour du produit
      const updates = {
        ...formData,
        prices: {
          public: Number(formData.prices.public),
          member: Number(formData.prices.member),
          partner: Number(formData.prices.partner),
        },
        stock_threshold: Number(formData.stock_threshold),
      };

      await productDataService.updateProduct(product.id, updates);

      // 2. Gestion des variantes
      // Suppressions
      const variantsToDelete = initialVariantIds.filter(id => !variants.find(v => v.id === id));
      for (const id of variantsToDelete) {
        await productDataService.deleteVariant(id);
      }

      // Créations et Mises à jour
      for (const variant of variants) {
        if (variant.id.startsWith('temp-')) {
          // Création
          await productDataService.createVariant({
            product_id: product.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: 0, // Stock initial 0 pour nouvelles variantes
            purchase_price: Number(variant.purchase_price),
            images: variant.images,
            available_for: variant.available_for && variant.available_for.length > 0 ? variant.available_for : undefined,
          });
        } else {
          // Mise à jour (on ignore le stock ici)
          await productDataService.updateVariant(variant.id, {
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            // stock: Number(variant.stock), // Ne pas mettre à jour le stock ici
            purchase_price: Number(variant.purchase_price),
            images: variant.images,
            available_for: variant.available_for && variant.available_for.length > 0 ? variant.available_for : undefined,
          });
        }
      }

      triggerRefresh();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Erreur lors de la mise à jour du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await productDataService.deleteProduct(product.id);
      triggerRefresh();
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePrice = (type: 'public' | 'member' | 'partner', value: string) => {
    setFormData(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [type]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le Produit" size="xl" scrollable>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Informations Générales</h3>
            <span className="text-xs font-mono text-gray-400">SKU: {product.sku}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit_name">Nom du produit *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit_type">Type *</Label>
              <Select
                id="edit_type"
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
              <Label htmlFor="edit_status">Statut</Label>
              <Select
                id="edit_status"
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
              <Label htmlFor="edit_category">Catégorie</Label>
              <Input
                id="edit_category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit_collection">Collection</Label>
              <Input
                id="edit_collection"
                value={formData.collection || ''}
                onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Prix & Logistique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tarification Vente (€)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit_price_public">Prix Public</Label>
                <Input
                  id="edit_price_public"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prices.public}
                  onChange={(e) => updatePrice('public', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit_price_member">Prix Adhérent</Label>
                <Input
                  id="edit_price_member"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prices.member}
                  onChange={(e) => updatePrice('member', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit_price_partner">Prix Partenaire</Label>
                <Input
                  id="edit_price_partner"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prices.partner}
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
                <Label htmlFor="edit_threshold">Seuil d'alerte stock global</Label>
                <Input
                  id="edit_threshold"
                  type="number"
                  min="0"
                  value={formData.stock_threshold}
                  onChange={(e) => setFormData({ ...formData, stock_threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-500">
                  Stock Total : <span className="font-bold text-gray-900 dark:text-white">{formData.total_stock}</span> unités
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Pour ajuster les stocks, utilisez l'onglet "Stock".
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Variantes */}
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Variantes & Images</h3>

          {/* Liste des variantes */}
          {variants.length > 0 && (
            <div className="space-y-2">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-start justify-between p-6 py-4 pr-3 bg-zinc-50 dark:bg-zinc-800 rounded-md"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Taille</Label>
                      <Input
                        className="h-8 mt-1"
                        value={variant.size || ''}
                        onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                        placeholder="Taille"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Couleur</Label>
                      <Input
                        className="h-8 mt-1"
                        value={variant.color || ''}
                        onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                        placeholder="Couleur"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">SKU</Label>
                      <Input
                        className="h-8 mt-1 text-xs font-mono"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Stock (lecture seule)</Label>
                      <Input
                        type="number"
                        disabled
                        className="h-8 mt-1 bg-gray-100 dark:bg-zinc-900 text-gray-500"
                        value={variant.stock}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Prix d'achat (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-8 mt-1"
                        value={variant.purchase_price}
                        onChange={(e) => handleVariantChange(variant.id, 'purchase_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Image URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          className="h-8 text-xs"
                          placeholder="https://..."
                          value={variant.images?.[0] || ''}
                          onChange={(e) => handleVariantImageChange(variant.id, e.target.value)}
                        />
                        {variant.images?.[0] && (
                          <ImageIcon size={16} className="text-zinc-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Disponible pour :</Label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(variant.available_for || ['public', 'member', 'partner']).includes('public')}
                            onChange={() => toggleVariantAvailability(variant.id, 'public')}
                            className="rounded"
                          />
                          Public
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(variant.available_for || ['public', 'member', 'partner']).includes('member')}
                            onChange={() => toggleVariantAvailability(variant.id, 'member')}
                            className="rounded"
                          />
                          Membre
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(variant.available_for || ['public', 'member', 'partner']).includes('partner')}
                            onChange={() => toggleVariantAvailability(variant.id, 'partner')}
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
                    onClick={() => handleRemoveVariant(variant.id)}
                    className="ml-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Formulaire d'ajout de variante */}
          <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-zinc-200 border-dashed dark:border-zinc-800 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Taille</Label>
                <Input
                  value={newVariant.size}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="Ex: M, L, XL..."
                  fullWidth
                />
              </div>
              <div>
                <Label>Couleur</Label>
                <Input
                  value={newVariant.color}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ex: Noir, Blanc..."
                  fullWidth
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Prix d'achat (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newVariant.purchasePrice}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="0.00"
                  fullWidth
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={newVariant.imageUrl}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  fullWidth
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
              className="w-full mt-3"
            >
              <Plus className="h-4 w-4" />
              Ajouter la variante
            </Button>
          </div>
        </div>

        {/* Média */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Visuel Principal</h3>
          <div>
            <Label htmlFor="edit_image">URL de l'image principale</Label>
            <Input
              id="edit_image"
              value={formData.main_image || ''}
              onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
            />
          </div>
        </div>
      </form>

      <ModalFooter>
        <Button 
          type="button" 
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="mr-auto"
        >
          <Trash2 size={16} className="mr-2" />
          Supprimer
        </Button>
        
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
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
