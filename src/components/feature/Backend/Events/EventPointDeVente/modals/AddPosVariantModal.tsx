'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/organisms';
import { Button, Input, Label, Select } from '@/components/ui/atoms';
import { Loader2 } from 'lucide-react';
import { createEventPosVariant, getPosSaleUnits } from '@/lib/supabase/eventPos';
import type { EventPosProduct, EventPosVariantInput } from '@/types/eventPos';
import { toast } from 'sonner';

const MERCH_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

interface AddPosVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EventPosProduct;
  onSuccess: () => void;
}

export function AddPosVariantModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: AddPosVariantModalProps) {
  const [loading, setLoading] = useState(false);
  const [saleUnits, setSaleUnits] = useState<{ id: string; value_cl: number; label: string }[]>([]);
  const [formData, setFormData] = useState<
    EventPosVariantInput & { stock_initial: number; container_capacity_cl?: number | null }
  >({
    price: 0,
    stock_initial: 0,
  });

  const isAlcool = product.category === 'alcool';
  const isMerch = product.category === 'merch';

  useEffect(() => {
    if (isOpen) {
      getPosSaleUnits().then((u) =>
        setSaleUnits(u as { id: string; value_cl: number; label: string }[])
      );
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEventPosVariant(product.id, {
        ...formData,
        container_type: isAlcool ? product.container_type ?? null : null,
        price: formData.price ?? 0,
        stock_initial: formData.stock_initial ?? 0,
      });
      toast.success('Variante ajoutée');
      setFormData({ price: 0, stock_initial: 0 });
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Variante — ${product.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="var-price">Prix (€)</Label>
          <Input
            id="var-price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price ?? 0}
            onChange={(e) =>
              setFormData((d) => ({ ...d, price: parseFloat(e.target.value) || 0 }))
            }
            placeholder="0"
            required
          />
        </div>
        {isMerch && (
          <>
            <div>
              <Label htmlFor="var-size">Taille</Label>
              <Select
                id="var-size"
                value={formData.size ?? ''}
                onChange={(e) => setFormData((d) => ({ ...d, size: e.target.value || null }))}
              >
                <option value="">—</option>
                {MERCH_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="var-color">Couleur</Label>
              <Input
                id="var-color"
                value={formData.color ?? ''}
                onChange={(e) => setFormData((d) => ({ ...d, color: e.target.value || null }))}
                placeholder="ex: Noir, Blanc"
              />
            </div>
            <div>
              <Label htmlFor="var-design">Design</Label>
              <Input
                id="var-design"
                value={formData.design ?? ''}
                onChange={(e) => setFormData((d) => ({ ...d, design: e.target.value || null }))}
                placeholder="ex: Collection 2026"
              />
            </div>
          </>
        )}
        {isAlcool && (
          <>
            <div>
              <Label htmlFor="var-capacity">Capacité contenant (cl)</Label>
              <Input
                id="var-capacity"
                type="number"
                min="0"
                value={formData.container_capacity_cl ?? ''}
                onChange={(e) =>
                  setFormData((d) => ({
                    ...d,
                    container_capacity_cl: parseInt(e.target.value, 10) || null,
                  }))
                }
                placeholder="ex: 5000 pour un fut 50L"
              />
            </div>
            <div>
              <Label htmlFor="var-sale-unit">Unité de vente</Label>
              <Select
                id="var-sale-unit"
                value={formData.sale_unit_id ?? ''}
                onChange={(e) => {
                  const unit = saleUnits.find((u) => u.id === e.target.value);
                  setFormData((d) => ({
                    ...d,
                    sale_unit_id: e.target.value || null,
                    sale_unit_cl: unit?.value_cl ?? null,
                  }));
                }}
              >
                <option value="">—</option>
                {saleUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}
        {product.has_stock && (
          <div>
            <Label htmlFor="var-stock">Stock initial</Label>
            <Input
              id="var-stock"
              type="number"
              min="0"
              value={formData.stock_initial ?? 0}
              onChange={(e) =>
                setFormData((d) => ({ ...d, stock_initial: parseInt(e.target.value, 10) || 0 }))
              }
            />
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
