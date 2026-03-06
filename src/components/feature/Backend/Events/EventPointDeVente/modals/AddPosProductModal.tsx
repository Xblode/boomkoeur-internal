'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Button, Input, Label, Select, Checkbox } from '@/components/ui/atoms';
import { Loader2 } from 'lucide-react';
import { createEventPosProduct, createEventPosVariant } from '@/lib/supabase/eventPos';
import { productDataService } from '@/lib/services/ProductDataService';
import type { Product } from '@/types/product';
import type { PosCategory, EventPosProductInput } from '@/types/eventPos';
import { toast } from 'sonner';

const CATEGORIES: { value: PosCategory; label: string }[] = [
  { value: 'alcool', label: 'Boissons' },
  { value: 'merch', label: 'Merch' },
  { value: 'billet', label: 'Billet' },
  { value: 'autre', label: 'Autre' },
];

const CONTAINER_TYPES: { value: string; label: string }[] = [
  { value: 'fut', label: 'Fut' },
  { value: 'cubi', label: 'Cubi' },
  { value: 'bouteille', label: 'Bouteille' },
  { value: 'canette', label: 'Canette' },
];

interface AddPosProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
  /** Catégorie présélectionnée à l'ouverture */
  defaultCategory?: PosCategory;
  /** Pour merch : liaison produit obligatoire, création des variantes depuis le catalogue */
  requireProductLink?: boolean;
}

export function AddPosProductModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
  defaultCategory = 'alcool',
  requireProductLink = false,
}: AddPosProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<EventPosProductInput & { name: string }>({
    name: '',
    category: defaultCategory,
    container_type: null,
    purchase_price: 0,
    has_stock: true,
    product_id: null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((d) => ({ ...d, category: defaultCategory, product_id: requireProductLink ? d.product_id : null }));
      productDataService.getProducts().then(setProducts).catch(() => setProducts([]));
    }
  }, [isOpen, defaultCategory, requireProductLink]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nom requis');
      return;
    }
    if (requireProductLink && !formData.product_id) {
      toast.error('Sélectionnez un produit du catalogue');
      return;
    }
    setLoading(true);
    try {
      const product = await createEventPosProduct(eventId, {
        name: formData.name.trim(),
        category: requireProductLink ? 'merch' : formData.category,
        container_type: formData.category === 'alcool' ? formData.container_type ?? null : null,
        purchase_price: Number(formData.purchase_price) || 0,
        has_stock: formData.has_stock ?? true,
        product_id: formData.product_id ?? null,
      });

      if (requireProductLink && formData.product_id) {
        const [productDetails, productVariants] = await Promise.all([
          productDataService.getProductById(formData.product_id),
          productDataService.getVariants(formData.product_id),
        ]);
        const variantPrice = productDetails?.prices?.public ?? 0;
        if (productVariants.length === 0) {
          await createEventPosVariant(product.id, {
            price: variantPrice,
            stock_initial: 0,
          });
        } else {
          for (const pv of productVariants) {
            await createEventPosVariant(product.id, {
              size: pv.size ?? null,
              color: pv.color ?? null,
              design: pv.design ?? null,
              price: variantPrice,
              stock_initial: pv.stock ?? 0,
            });
          }
        }
      } else {
        await createEventPosVariant(product.id, {
          price: 0,
          stock_initial: 0,
          ...(formData.category === 'alcool' &&
            formData.container_type && { container_type: formData.container_type }),
        });
      }

      toast.success('Produit ajouté');
      setFormData({
        name: '',
        category: defaultCategory,
        container_type: null,
        purchase_price: 0,
        has_stock: true,
        product_id: null,
      });
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  const isBillet = formData.category === 'billet';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={requireProductLink ? 'Ajouter un merch' : 'Ajouter un produit'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="pos-name">Nom</Label>
          <Input
            id="pos-name"
            value={formData.name}
            onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
            placeholder="ex: Bière 25cl, T-shirt, Entrée"
            required
          />
        </div>
        {!requireProductLink && (
          <div>
            <Label htmlFor="pos-category">Catégorie</Label>
            <Select
              id="pos-category"
              value={formData.category}
              onChange={(e) =>
                setFormData((d) => ({
                  ...d,
                  category: e.target.value as PosCategory,
                  has_stock: e.target.value !== 'billet',
                  ...(e.target.value !== 'alcool' && { container_type: null }),
                }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        )}
        {formData.category === 'alcool' && (
          <div>
            <Label htmlFor="pos-container">Contenant</Label>
            <Select
              id="pos-container"
              value={formData.container_type ?? ''}
              onChange={(e) =>
                setFormData((d) => ({
                  ...d,
                  container_type: e.target.value || null,
                }))
              }
            >
              <option value="">Aucun</option>
              {CONTAINER_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="pos-price">Prix d&apos;achat unitaire (€)</Label>
          <Input
            id="pos-price"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchase_price ?? ''}
            onChange={(e) => setFormData((d) => ({ ...d, purchase_price: parseFloat(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="pos-has-stock"
            checked={formData.has_stock ?? true}
            onCheckedChange={(checked) =>
              setFormData((d) => ({ ...d, has_stock: checked === true }))
            }
            disabled={isBillet}
          />
          <Label htmlFor="pos-has-stock" className="cursor-pointer">
            Gérer le stock (désactivé pour les billets)
          </Label>
        </div>
        {(formData.category === 'merch' || requireProductLink) && (
          <div>
            <Label htmlFor="pos-product">
              {requireProductLink ? 'Produit du catalogue *' : 'Lier au catalogue'}
            </Label>
            <Select
              id="pos-product"
              value={formData.product_id ?? ''}
              onChange={(e) => {
                const pid = e.target.value || null;
                const prod = pid ? products.find((p) => p.id === pid) : null;
                setFormData((d) => ({
                  ...d,
                  product_id: pid,
                  ...(prod && requireProductLink && { name: prod.name }),
                }));
              }}
            >
              <option value="">{requireProductLink ? 'Sélectionner...' : 'Aucun'}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>
          </div>
        )}
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Ajout...
              </>
            ) : (
              'Ajouter'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
