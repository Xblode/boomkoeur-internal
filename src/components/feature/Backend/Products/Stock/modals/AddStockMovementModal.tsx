'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Button, Input, Label, Select, Textarea } from '@/components/ui/atoms';
import { Product, ProductVariant, StockMovementInput } from '@/types/product';
import { productDataService } from '@/lib/services/ProductDataService';
import { useProduct } from '@/components/providers';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface AddStockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VariantQuantity = {
  variantId: string;
  quantity: number;
};

export default function AddStockMovementModal({ isOpen, onClose }: AddStockMovementModalProps) {
  const { triggerRefresh } = useProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data sources
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [reason, setReason] = useState('purchase');
  const [notes, setNotes] = useState('');
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      // Reset form
      setSelectedProductId('');
      setType('in');
      setReason('purchase');
      setNotes('');
      setVariants([]);
      setVariantQuantities({});
    }
  }, [isOpen]);

  // Load variants when product changes
  useEffect(() => {
    if (selectedProductId) {
      loadVariants(selectedProductId);
    } else {
      setVariants([]);
      setVariantQuantities({});
    }
  }, [selectedProductId]);

  const loadProducts = async () => {
    try {
      const data = await productDataService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadVariants = async (productId: string) => {
    try {
      const data = await productDataService.getVariants(productId);
      setVariants(data);
      
      // Initialize quantities to 0 for all variants
      const initialQuantities: Record<string, number> = {};
      data.forEach(variant => {
        initialQuantities[variant.id] = 0;
      });
      setVariantQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const updateVariantQuantity = (variantId: string, quantity: number) => {
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(0, quantity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    // Filter variants with quantity > 0
    const variantsToUpdate = Object.entries(variantQuantities).filter(([_, qty]) => qty > 0);
    
    if (variantsToUpdate.length === 0) {
      alert('Veuillez saisir au moins une quantité pour une variante');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a movement for each variant with quantity > 0
      for (const [variantId, quantity] of variantsToUpdate) {
        const movement: StockMovementInput = {
          product_id: selectedProductId,
          variant_id: variantId,
          type,
          quantity: Number(quantity),
          reason: reason as any,
          notes,
          date: new Date().toISOString(),
        };
        await productDataService.addStockMovement(movement);
      }

      triggerRefresh();
      onClose();
    } catch (error) {
      console.error('Error adding stock movement:', error);
      alert('Erreur lors de l\'ajout du mouvement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariantLabel = (v: ProductVariant) => {
    if (!v.size && !v.color) return 'Standard / Unique';
    return `${v.size || ''} ${v.color || ''} (Stock: ${v.stock})`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Mouvement de Stock" size="lg" scrollable>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Type de mouvement */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setType('out');
              setReason('sale');
            }}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors h-auto ${
              type === 'out'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'border-zinc-200 hover:border-red-200 dark:border-zinc-800'
            }`}
          >
            <ArrowDownCircle size={24} />
            <span className="font-semibold">Sortie (Vente, Perte)</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setType('in');
              setReason('purchase');
            }}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors h-auto ${
              type === 'in'
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'border-zinc-200 hover:border-green-200 dark:border-zinc-800'
            }`}
          >
            <ArrowUpCircle size={24} />
            <span className="font-semibold">Entrée (Achat, Retour)</span>
          </Button>
        </div>

        {/* Sélection Produit */}
        <div>
          <Label htmlFor="product">Produit</Label>
          <Select
            id="product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={[
              { value: '', label: 'Sélectionner un produit...' },
              ...products.map(p => ({ value: p.id, label: p.name }))
            ]}
            required
          />
        </div>

        {/* Variantes avec quantités */}
        {selectedProductId && variants.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Quantités par variante
            </h3>
            
            <div className="space-y-2">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {!variant.size && !variant.color 
                        ? 'Standard / Unique' 
                        : `${variant.size || ''} ${variant.color || ''}`.trim()}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Stock actuel : {variant.stock} unités
                    </p>
                  </div>
                  <div className="w-32">
                    <Label className="text-xs mb-1 block">Quantité</Label>
                    <Input
                      type="number"
                      min="0"
                      className="h-9"
                      value={variantQuantities[variant.id] || 0}
                      onChange={(e) => updateVariantQuantity(variant.id, parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Détails Raison */}
        <div>
          <Label htmlFor="reason">Raison</Label>
          <Select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={type === 'out' ? [
              { value: 'sale', label: 'Vente' },
              { value: 'loss', label: 'Perte / Vol' },
              { value: 'adjustment', label: 'Ajustement Inventaire' },
              { value: 'other', label: 'Autre' },
            ] : [
              { value: 'purchase', label: 'Achat Fournisseur' },
              { value: 'return', label: 'Retour Client' },
              { value: 'adjustment', label: 'Ajustement Inventaire' },
              { value: 'other', label: 'Autre' },
            ]}
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optionnel)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Détails supplémentaires (ex: Vente festival X)"
            rows={2}
          />
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
          disabled={isSubmitting || !selectedProductId} 
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Enregistrement...' : 'Valider le mouvement'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
